"use client"

import dynamic from 'next/dynamic'
import { useState } from 'react'
import AssetsList from './components/AssetsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TransactionList from './components/TransactionList'
const KLineChart = dynamic(
    () => import('./components/KLineChart'),
    { ssr: false }
)

const PERIODS = [
    { label: '1s', value: '1s' },
    { label: '1min', value: '1m' },
    { label: '5min', value: '5m' },
    { label: '15min', value: '15m' },
    { label: '1h', value: '1h' },
]

export default function Home() {
    const [period, setPeriod] = useState('1m')
    const [selectedSymbol, setSelectedSymbol] = useState('MEME/SOL')
    const [tokenAddress, setTokenAddress] = useState('')

    return (
        <div className="grid grid-cols-6 h-screen max-w-full bg-background p-4 gap-4">
            <section className="col-span-1 min-w-0">
                <AssetsList 
                    selectedSymbol={selectedSymbol}
                    onSelectSymbol={setSelectedSymbol}
                    onSelectTokenAddress={setTokenAddress}
                />
            </section>

            <section className="col-span-4 min-w-0 flex flex-col gap-4">
                <div className="bg-card rounded-lg p-4 flex-1">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-lg font-semibold">{selectedSymbol}</div>
                        <div className="flex gap-2">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`px-4 py-2 rounded ${
                                        period === p.value
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[calc(100%-3rem)]">
                        <KLineChart period={period} symbol={selectedSymbol} />
                    </div>
                </div>
                
                <div className="h-[300px]">
                    <TransactionList symbol={selectedSymbol} />
                </div>
            </section>

            <section className="col-span-1 min-w-0">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>代币信息</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">代币名称</div>
                                <div className="font-medium">{selectedSymbol.split('/')[0]}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">交易对</div>
                                <div className="font-medium">{selectedSymbol}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">代币地址</div>
                                <div className="font-medium break-all">{tokenAddress}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
