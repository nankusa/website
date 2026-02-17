'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Loader2, Box } from 'lucide-react'
import { toast } from 'sonner'
import 'echarts-gl'

import './types'
import { taskTypes, labels, EXAMPLE_CIFS } from './constants'
import { Switch } from './Switch'
import { useApi } from './hooks/useApi'
import { useMoleculeViewer, useAttentionViewer } from './hooks/use3DViewer'
import { useBoxPlot, useEnergyChart } from './hooks/useCharts'
import type { ModalData } from './types'

export function SpbNetDemo() {
  const [cifid, setCifid] = useState('abb3976_data_s1')
  const [cifStr, setCifStr] = useState<string | null>(null)
  const [taskType, setTaskType] = useState('adsorption')
  const [attnTask, setAttnTask] = useState('CO2')
  const [loadingStructure, setLoadingStructure] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [loadingAttn, setLoadingAttn] = useState(false)
  const [properties, setProperties] = useState<Record<string, number>>({})
  const [modalData, setModalData] = useState<ModalData>({
    xyz: '',
    energy: null,
    attns: {},
  })
  const [showEnergy, setShowEnergy] = useState(false)
  const [spin, setSpin] = useState(true)
  const [ratio, setRatio] = useState(50)
  const [percentile, setPercentile] = useState(50)
  const [max, setMax] = useState(50)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const molViewerRef = useRef<HTMLDivElement>(null)
  const attnViewerRef = useRef<HTMLDivElement>(null)
  const boxPlotRef = useRef<HTMLDivElement>(null)
  const energyChartRef = useRef<HTMLDivElement>(null)

  const tasks = taskTypes[taskType as keyof typeof taskTypes]
  const currentLabels = labels[taskType as keyof typeof labels]

  const { post, get } = useApi()

  useMoleculeViewer(modalData.xyz, spin, molViewerRef)
  useAttentionViewer(modalData.xyz, modalData.attns, attnTask, ratio, percentile, max, attnViewerRef)
  useBoxPlot(taskType, tasks, properties, currentLabels, cifid, boxPlotRef)
  useEnergyChart(showEnergy, modalData.energy, energyChartRef)

  const fetchModalData = async (id: string) => {
    setLoadingStructure(true)
    try {
      const data = await get('/modal', { cifid: id })
      setModalData((prev) => ({
        ...prev,
        xyz: data.xyz,
        energy: data.energy,
      }))
    } catch (err) {
      toast.error('Failed to fetch structure data', {
        description: 'Unable to load molecular structure. Please check the CIF ID or try again.',
        duration: 5000,
      })
      console.error('Failed to fetch modal data:', err)
    } finally {
      setLoadingStructure(false)
    }
  }

  const fetchProperties = async (id: string) => {
    setLoadingProperties(true)
    try {
      const props: Record<string, number> = {}
      for (const task of tasks) {
        const taskParam = task.replace('/', '')
        const data = await get('/property', { cifid: id, task: taskParam })
        props[task] = task === 'Tsd' ? 0.01 * data.value : data.value
      }
      setProperties(props)
    } catch (err) {
      toast.error('Failed to fetch property predictions', {
        description: 'Unable to calculate material properties. Please try again.',
        duration: 5000,
      })
      console.error('Failed to fetch properties:', err)
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchAttn = async (id: string, task: string) => {
    setLoadingAttn(true)
    try {
      const taskParam = task.replace('/', '')
      const data = await get('/attn', { cifid: id, task: taskParam })
      setModalData((prev) => ({
        ...prev,
        attns: {
          ...prev.attns,
          [task]: data.attn,
        },
      }))
    } catch (err) {
      toast.error('Failed to fetch attention data', {
        description: 'Unable to compute attention scores. Please try again.',
        duration: 5000,
      })
      console.error('Failed to fetch attention:', err)
    } finally {
      setLoadingAttn(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.cif')) {
      toast.error('Invalid file format', {
        description: 'Please select a .cif file (Crystallographic Information File).',
        duration: 5000,
      })
      return
    }
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      const id = file.name.slice(0, file.name.length - 4)
      
      setLoadingStructure(true)
      setLoadingProperties(true)
      setLoadingAttn(true)
      
      try {
        const data = await post('/cif', { cifid: id, cif_str: content })
        const newCifid = data.cifid
        
        const [modalData, attnData, propsData] = await Promise.all([
          get('/modal', { cifid: newCifid }),
          get('/attn', { cifid: newCifid, task: attnTask.replace('/', '') }),
          (async () => {
            const props: Record<string, number> = {}
            for (const task of tasks) {
              const taskParam = task.replace('/', '')
              const result = await get('/property', { cifid: newCifid, task: taskParam })
              props[task] = task === 'Tsd' ? 0.01 * result.value : result.value
            }
            return props
          })(),
        ])
        
        setCifid(newCifid)
        setCifStr(null)
        setModalData({
          xyz: modalData.xyz,
          energy: modalData.energy,
          attns: { [attnTask]: attnData.attn },
        })
        setProperties(propsData)
        
        toast.success('CIF file uploaded', {
          description: `Successfully processed "${id}.cif"`,
          duration: 3000,
        })
      } catch (err) {
        toast.error('Failed to process CIF file', {
          description: 'The server could not process the crystal structure. Please verify the CIF format.',
          duration: 5000,
        })
        console.error('Failed to upload CIF:', err)
      } finally {
        setLoadingStructure(false)
        setLoadingProperties(false)
        setLoadingAttn(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    const loadCifData = async () => {
      setLoadingStructure(true)
      setLoadingProperties(true)
      setLoadingAttn(true)
      try {
        await post('/cif', { cifid })
        await Promise.all([
          fetchModalData(cifid),
          fetchAttn(cifid, attnTask),
          fetchProperties(cifid),
        ])
      } catch (err) {
        toast.error('Failed to load CIF data', {
          description: 'Unable to process the crystal structure. Please check if the CIF ID exists.',
          duration: 5000,
        })
        console.error('Failed to load CIF data:', err)
        setLoadingStructure(false)
        setLoadingProperties(false)
        setLoadingAttn(false)
      }
    }
    loadCifData()
  }, [cifid])

  useEffect(() => {
    setAttnTask(tasks[0])
    fetchProperties(cifid)
  }, [taskType])

  useEffect(() => {
    fetchAttn(cifid, attnTask)
  }, [attnTask])

  const isLoading = loadingStructure || loadingProperties || loadingAttn

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5" />
              SpbNet: Crystal Structure Analysis
            </CardTitle>
            <CardDescription>
              Analyze crystal structures and predict material properties using deep learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-medium">CIF ID</Label>
                  <div className="relative">
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center text-sm">
                      {cifid}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button asChild className="relative h-10 gap-2" disabled={isLoading}>
                    <label className="cursor-pointer">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isLoading ? 'Processing...' : 'Upload CIF'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".cif"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                      />
                    </label>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Example Structures</Label>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_CIFS.map((exampleCif) => (
                    <Button
                      key={exampleCif}
                      variant={cifid === exampleCif ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCifid(exampleCif)}
                      disabled={isLoading}
                      className="rounded-full"
                    >
                      {exampleCif}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          <CardContent className="pt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Spin</span>
                <Switch checked={spin} onCheckedChange={setSpin} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Structure</span>
                <Switch checked={showEnergy} onCheckedChange={setShowEnergy} />
                <span className="text-sm font-medium">Energy</span>
              </div>
            </div>

            <div className="relative">
              {loadingStructure && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading structure...</span>
                  </div>
                </div>
              )}
              <div
                ref={energyChartRef}
                className="bg-muted rounded-lg"
                style={{ 
                  width: '100%', 
                  aspectRatio: '1.5',
                  display: showEnergy ? 'block' : 'none'
                }}
              />
              <div
                ref={molViewerRef}
                className="bg-muted rounded-lg"
                style={{ 
                  width: '100%', 
                  aspectRatio: '1.5', 
                  position: 'relative',
                  display: showEnergy ? 'none' : 'block'
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full">
          <CardContent className="pt-6">
            <Tabs value={taskType} onValueChange={(v) => setTaskType(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="adsorption">Adsorption</TabsTrigger>
                <TabsTrigger value="separation">Separation</TabsTrigger>
                <TabsTrigger value="intrinsic">Intrinsic</TabsTrigger>
              </TabsList>

              <div className="relative">
                {loadingProperties && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading properties...</span>
                    </div>
                  </div>
                )}
                <div
                  ref={boxPlotRef}
                  className="bg-white rounded-lg border"
                  style={{ width: '100%', aspectRatio: '1.3' }}
                />
              </div>
            </Tabs>

            <div className="flex flex-col xl:flex-row gap-6 mt-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-center mb-2">
                  Attention score of {attnTask}
                </h3>
                <div className="relative">
                  {(loadingAttn || loadingStructure) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading attention...</span>
                      </div>
                    </div>
                  )}
                  <div
                    ref={attnViewerRef}
                    className="bg-muted rounded-lg"
                    style={{ width: '100%', aspectRatio: '1.5', position: 'relative' }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Larger atoms are more important
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4">
                <div>
                  <Label className="text-center block mb-2 font-bold">Task Type</Label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {tasks.map((task) => (
                      <Button
                        key={task}
                        variant={attnTask === task ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAttnTask(task)}
                        disabled={loadingAttn}
                      >
                        {task}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-center block font-bold">Ratio</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">{ratio}%</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-center block font-bold">Percentile</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentile}
                    onChange={(e) => setPercentile(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">{percentile}%</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-center block font-bold">Max</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={max}
                    onChange={(e) => setMax(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">{max}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
