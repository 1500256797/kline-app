"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react"
import getTxList, { ProcessedTransaction } from "../api/getTxList"

interface TransactionListProps {
    symbol?: string
}

const TransactionList = ({symbol}: TransactionListProps) => {
    const [transactions, setTransactions] = useState<ProcessedTransaction[]>([])
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const fetchTransactions = async () => {
        const data = await getTxList(symbol || 'MEME/SOL', 0, 100)
        if (data) {
            setTransactions(data)
        }
    }

    useEffect(() => {
        // 清除之前的定时器
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        // 立即获取一次数据
        fetchTransactions()

        // 设置新的定时器
        intervalRef.current = setInterval(fetchTransactions, 1000)

        // 清理函数
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            setTransactions([]) // 清空数据
        }
    }, [symbol])

    return (
        <div className="border rounded-lg bg-white">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{symbol} 交易记录</h2>
            </div>

            <ScrollArea className="h-[250px] w-full">
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead className="w-[120px]">时间</TableHead>
                            <TableHead className="w-[80px]">类型</TableHead>
                            <TableHead className="w-[100px]">价格</TableHead>
                            <TableHead className="w-[100px]">数量</TableHead>
                            <TableHead className="w-[120px]">总额</TableHead>
                            <TableHead className="w-[200px]">交易者</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[200px] text-center text-gray-500">
                                    {symbol} 暂无交易记录
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell className="text-gray-600">
                                        {new Date(tx.time * 1000).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={tx.side === "BUY" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                            {tx.side === "BUY" ? "买入" : "卖出"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono">${tx.price.toFixed(4)}</TableCell>
                                    <TableCell className="font-mono">{tx.amount}M</TableCell>
                                    <TableCell className="font-mono">${tx.total.toFixed(5)}</TableCell>
                                    <TableCell className="text-gray-600 font-mono text-sm">{tx.trader_address}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}

export default TransactionList
