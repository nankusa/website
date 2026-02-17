import { useEffect, useRef, MutableRefObject } from 'react'
import * as echarts from 'echarts'
import { sourceTypes } from '../constants'

export function useBoxPlot(
  taskType: string,
  tasks: string[],
  properties: Record<string, number>,
  currentLabels: string[],
  cifid: string,
  boxPlotRef: MutableRefObject<HTMLDivElement | null>
) {
  const boxPlotInstance = useRef<echarts.ECharts | null>(null)
  const sources = sourceTypes[taskType as keyof typeof sourceTypes]
  const markpoints = tasks.map((task) => {
    return {
      value: properties[task]?.toFixed(2) || '0',
      color: 'red',
    }
  })

  useEffect(() => {
    if (!boxPlotRef.current) return

    const getMarkpoint = (point: any, idx: number) => {
      return {
        coord: [idx, point.value],
        itemStyle: {
          normal: {
            color: {
              type: 'radial',
              cx: 0.5,
              cy: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#81889d' },
                { offset: 0.7, color: '#81889dbb' },
                { offset: 1, color: '#81889dee' },
              ],
              global: false,
            },
            shape: 'circle',
          },
          emphasis: {
            color: {
              type: 'radial',
              cx: 0.5,
              cy: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#81889d' },
                { offset: 0.7, color: '#81889dee' },
                { offset: 1, color: '#81889daa' },
              ],
              global: false,
            },
          },
        },
      }
    }

    const getSeries = (rightY = false) => {
      return {
        name: 'boxplot',
        type: 'boxplot',
        data: sources,
        yAxisIndex: rightY ? 1 : 0,
        itemStyle: {
          normal: {
            color: '#f3eee7',
            borderColor: '#c2c4d5',
            borderWidth: 1.5,
          },
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 15,
          data: tasks.map((_, idx) => getMarkpoint(markpoints[idx], idx)),
          tooltip: {
            show: true,
            formatter: (params: any) => {
              const data = params.data
              return `${cifid}:\n${data.coord[1]}`
            },
          },
        },
      }
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          if (params.seriesType === 'boxplot') {
            let result = `${params.name} <br/>`
            result += `Q1: ${params.data[2]} <br/>`
            result += `Q3: ${params.data[4]} <br/>`
            const idx = params.dataIndex
            result += `${cifid}:\n${markpoints[idx].value}`
            return result
          }
          return ''
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        backgroundColor: 'white',
      },
      xAxis: {
        type: 'category',
        data: currentLabels,
        splitArea: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
        },
        {
          type: 'value',
          name: '',
          splitLine: {
            show: true,
          },
          position: 'right',
        },
      ],
      series: [getSeries(false)] as any,
    }

    if (!boxPlotInstance.current) {
      boxPlotInstance.current = echarts.init(boxPlotRef.current)
    }

    boxPlotInstance.current.setOption(option, true)

    const handleResize = () => {
      boxPlotInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [sources, markpoints, currentLabels, cifid, tasks, boxPlotRef])
}

export function useEnergyChart(
  showEnergy: boolean,
  energy: any,
  energyChartRef: MutableRefObject<HTMLDivElement | null>
) {
  const energyChartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!showEnergy || !energy || !energyChartRef.current) return

    const data = []
    let minVal = 100000
    let maxVal = -100000

    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        for (let k = 0; k < 30; k++) {
          const value = energy[i][j][k]
          if (value > maxVal) {
            maxVal = value
          }
          if (value < minVal) {
            minVal = value
          }
          data.push([i, j, k, value])
        }
      }
    }

    const option: echarts.EChartsOption = {
      visualMap: {
        show: false,
        min: minVal * 10,
        max: 1000000,
        inRange: {
          symbolSize: [0.5, 25],
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026',
          ],
          colorAlpha: [0.2, 1],
        },
      },
      xAxis3D: {
        type: 'value',
      },
      yAxis3D: {
        type: 'value',
      },
      zAxis3D: {
        type: 'value',
      },
      grid3D: {
        axisLine: {
          lineStyle: { color: '#888' },
        },
        axisPointer: {
          lineStyle: { color: '#888' },
        },
        viewControl: {},
      },
      series: [
        {
          type: 'scatter3D',
          name: 'Energy [kJ/mol]',
          data: data,
        },
      ] as any,
      tooltip: {
        textStyle: {
          color: '#888',
        },
      },
    }

    if (!energyChartInstance.current) {
      energyChartInstance.current = echarts.init(energyChartRef.current)
    }

    energyChartInstance.current.setOption(option, true)

    const handleResize = () => {
      energyChartInstance.current?.resize()
    }

    const timeoutIds: number[] = []
    timeoutIds.push(window.setTimeout(() => {
      energyChartInstance.current?.resize()
    }, 100))
    timeoutIds.push(window.setTimeout(() => {
      energyChartInstance.current?.resize()
    }, 300))
    timeoutIds.push(window.setTimeout(() => {
      energyChartInstance.current?.resize()
    }, 500))

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [energy, showEnergy, energyChartRef])

  useEffect(() => {
    if (showEnergy && energyChartRef.current && energy) {
      if (energyChartInstance.current) {
        energyChartInstance.current.dispose()
      }
      energyChartInstance.current = null
      
      const timeoutIds: number[] = []
      
      timeoutIds.push(window.setTimeout(() => {
        if (energyChartRef.current) {
          energyChartInstance.current = echarts.init(energyChartRef.current)
          
          const data = []
          let minVal = 100000
          let maxVal = -100000

          for (let i = 0; i < 30; i++) {
            for (let j = 0; j < 30; j++) {
              for (let k = 0; k < 30; k++) {
                const value = energy[i][j][k]
                if (value > maxVal) {
                  maxVal = value
                }
                if (value < minVal) {
                  minVal = value
                }
                data.push([i, j, k, value])
              }
            }
          }

          const option: echarts.EChartsOption = {
            visualMap: {
              show: false,
              min: minVal * 10,
              max: 1000000,
              inRange: {
                symbolSize: [0.5, 25],
                color: [
                  '#313695',
                  '#4575b4',
                  '#74add1',
                  '#abd9e9',
                  '#e0f3f8',
                  '#ffffbf',
                  '#fee090',
                  '#fdae61',
                  '#f46d43',
                  '#d73027',
                  '#a50026',
                ],
                colorAlpha: [0.2, 1],
              },
            },
            xAxis3D: {
              type: 'value',
            },
            yAxis3D: {
              type: 'value',
            },
            zAxis3D: {
              type: 'value',
            },
            grid3D: {
              axisLine: {
                lineStyle: { color: '#888' },
              },
              axisPointer: {
                lineStyle: { color: '#888' },
              },
              viewControl: {},
            },
            series: [
              {
                type: 'scatter3D',
                name: 'Energy [kJ/mol]',
                data: data,
              },
            ] as any,
            tooltip: {
              textStyle: {
                color: '#888',
              },
            },
          }
          
          energyChartInstance.current.setOption(option, true)
          
          timeoutIds.push(window.setTimeout(() => {
            energyChartInstance.current?.resize()
          }, 50))
          timeoutIds.push(window.setTimeout(() => {
            energyChartInstance.current?.resize()
          }, 150))
          timeoutIds.push(window.setTimeout(() => {
            energyChartInstance.current?.resize()
          }, 300))
        }
      }, 10))
      
      return () => {
        timeoutIds.forEach(id => clearTimeout(id))
      }
    }
  }, [showEnergy, energy, energyChartRef])
}
