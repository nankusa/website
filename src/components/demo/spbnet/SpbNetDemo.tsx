'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Loader2, Box } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
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

  const fetchModalData = useCallback(async () => {
    try {
      const data = await get('/modal', { cifid })
      setModalData((prev) => ({
        ...prev,
        xyz: data.xyz,
        energy: data.energy,
      }))
    } catch (err) {
      console.error('Failed to fetch modal data:', err)
    }
  }, [cifid, get])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const props: Record<string, number> = {}
      for (const task of tasks) {
        const taskParam = task.replace('/', '')
        const data = await get('/property', { cifid, task: taskParam })
        props[task] = task === 'Tsd' ? 0.01 * data.value : data.value
      }
      setProperties(props)
    } catch (err) {
      console.error('Failed to fetch properties:', err)
    } finally {
      setLoading(false)
    }
  }, [cifid, tasks, get])

  const fetchAttn = useCallback(async () => {
    try {
      const taskParam = attnTask.replace('/', '')
      const data = await get('/attn', { cifid, task: taskParam })
      setModalData((prev) => ({
        ...prev,
        attns: {
          ...prev.attns,
          [attnTask]: data.attn,
        },
      }))
    } catch (err) {
      console.error('Failed to fetch attention:', err)
    }
  }, [cifid, attnTask, get])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.cif')) {
      console.error('Error: Please select a .cif file')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const id = file.name.slice(0, file.name.length - 4)
      setCifid(id)
      setCifStr(content)
    }
    reader.readAsText(file)
  }

  const handleCifUpload = async () => {
    setLoading(true)
    try {
      const payload = cifStr ? { cifid, cif_str: cifStr } : { cifid }
      const data = await post('/cif', payload)
      setCifid(data.cifid)
      setCifStr(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Failed to upload CIF:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cifid) {
      fetchModalData()
      fetchAttn()
      fetchProperties()
    }
  }, [cifid])

  useEffect(() => {
    setAttnTask(tasks[0])
    fetchProperties()
  }, [taskType])

  useEffect(() => {
    fetchAttn()
  }, [attnTask])

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
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label htmlFor="cifid">CIF ID / Structure Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cifid"
                      value={cifid}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCifid(e.target.value)
                        setCifStr(null)
                      }}
                      placeholder="Enter CIF ID"
                    />
                    <Button onClick={handleCifUpload} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload CIF File</Label>
                  <div className="relative">
                    <Button asChild>
                      <label>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".cif"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                    </Button>
                  </div>
                  {cifStr && (
                    <p className="text-sm text-green-600 mt-1">
                      File loaded: {cifid}.cif
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Example Structures</Label>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_CIFS.map((exampleCif) => (
                    <Button
                      key={exampleCif}
                      variant={cifid === exampleCif ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCifid(exampleCif)}
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

              <div
                ref={boxPlotRef}
                className="bg-white rounded-lg border"
                style={{ width: '100%', aspectRatio: '1.3' }}
              />
            </Tabs>

            <div className="flex flex-col xl:flex-row gap-6 mt-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-center mb-2">
                  Attention score of {attnTask}
                </h3>
                <div
                  ref={attnViewerRef}
                  className="bg-muted rounded-lg"
                  style={{ width: '100%', aspectRatio: '1.5', position: 'relative' }}
                />
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
