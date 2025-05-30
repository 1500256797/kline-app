"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAssets } from "../hooks/useAssets"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetsListProps {
  onSelectSymbol?: (symbol: string) => void;
  selectedSymbol?: string;
  onSelectTokenAddress?: (tokenAddress: string) => void;
}

const AssetsList = ({ onSelectSymbol, selectedSymbol, onSelectTokenAddress }: AssetsListProps) => {
  const { assets, loading, error, refetch } = useAssets()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">币种列表</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw 
              className={cn(
                "h-4 w-4", 
                loading && "animate-spin"
              )} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && (
          <div className="flex items-center justify-center h-20">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-20">
            <div className="text-sm text-destructive">错误: {error}</div>
          </div>
        )}
        {!loading && !error && assets.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <div className="text-sm text-muted-foreground">暂无数据</div>
          </div>
        )}
        {!loading && !error && assets.length > 0 && (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>交易对</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead className="text-center">精度</TableHead>
                  <TableHead>类型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow 
                    key={asset.id} 
                    className={cn(
                      "hover:bg-muted/50 cursor-pointer",
                      selectedSymbol === asset.symbol && "bg-muted"
                    )}
                    onClick={() => {
                      onSelectSymbol?.(asset.symbol)
                      onSelectTokenAddress?.(asset.token_address)
                    }}
                  >
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-sm">{asset.symbol}</TableCell>
                    <TableCell className="text-xs font-mono">
                      <span title={asset.token_address}>{truncateAddress(asset.token_address)}</span>
                    </TableCell>
                    <TableCell className="text-center">{asset.decimals}</TableCell>
                    <TableCell>
                      <Badge variant={asset.is_nft ? "default" : "secondary"} className="text-xs">
                        {asset.is_nft ? "NFT" : "Token"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export default AssetsList