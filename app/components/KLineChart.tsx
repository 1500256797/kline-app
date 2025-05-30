'use client'

import { useEffect, useState } from 'react'
import { init, dispose } from 'klinecharts'
import type { Chart } from 'klinecharts'
import { useKlineStream } from '../hooks/useKlineStream'

interface KLineChartProps {
    period: string
    symbol: string
}

export default function KLineChart({ period, symbol }: KLineChartProps) {
    const [chartId, setChartId] = useState('chart')
    const { klineData, error } = useKlineStream(symbol, period)
    const [chart, setChart] = useState<Chart | null>(null)

    // 监听 symbol 变化，重新创建图表容器
    useEffect(() => {
        dispose(chartId)
        setChartId(`chart-${Date.now()}`) // 生成新的图表ID
        setChart(null)
    }, [symbol])

    // 初始化图表
    useEffect(() => {
        if (!chart) {
            const chartInstance = init(chartId, {
                styles: {
                    grid: {
                        show: true,
                    },
                }
            })
            if (chartInstance) {
                // 设置技术指标
                chartInstance.setStyles({
                    indicator: {
                        volume: {
                            bar: {
                                upColor: '#26A69A',
                                downColor: '#EF5350',
                                noChangeColor: '#888888'
                            }
                        }
                    }
                })
                // 创建成交量指标
                chartInstance.createIndicator('VOL', false)
            }
            setChart(chartInstance)
        }
        
        return () => {
            dispose(chartId)
        }
    }, [chartId])

    useEffect(() => {
        if (chart && klineData.length > 0) {
            chart.applyNewData(klineData)
        }
    }, [klineData, chart])

    if (error) {
        return (
            <div className="text-red-500">Error: {error}</div>
        )
    }

    return (
        <div id={chartId} style={{ width: '100%', height: '100%' }} />
    )
} 