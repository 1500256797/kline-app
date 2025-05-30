import { useState, useEffect, useRef } from 'react'
import type { KLineData } from 'klinecharts'
import { baseURL } from '../config'

interface KlineResponse {
	klines: {
		timestamp: string
		raw_open: number
		open_decimals: number
		raw_close: number
		close_decimals: number
		raw_high: number
		high_decimals: number
		raw_low: number
		low_decimals: number
		raw_volume: number
		volume_decimals: number
		raw_turnover: number
		turnover_decimals: number
	}[]
}

const convertDecimalValue = (rawValue: number, decimals: number): number => {
	return rawValue / Math.pow(10, decimals)
}

const convertToKLineData = (data: KlineResponse): KLineData[] => {
	return data.klines.map((kline) => ({
		timestamp: new Date(Number(kline.timestamp) * 1000).getTime(),
		open: convertDecimalValue(kline.raw_open, kline.open_decimals),
		close: convertDecimalValue(kline.raw_close, kline.close_decimals),
		high: convertDecimalValue(kline.raw_high, kline.high_decimals),
		low: convertDecimalValue(kline.raw_low, kline.low_decimals),
		volume: convertDecimalValue(kline.raw_volume, kline.volume_decimals),
	}))
}

export const useKlineStream = (symbol: string, interval: string) => {
	const [klineData, setKlineData] = useState<KLineData[]>([])
	const [error, setError] = useState<string | null>(null)
	const currentIntervalRef = useRef<string>(interval)
	useEffect(() => {
		let isSubscribed = true
		let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

		if (currentIntervalRef.current !== interval) {
			setKlineData([])
			setError(null)
			currentIntervalRef.current = interval
		}

		const fetchStream = async () => {
			try {
				const response = await fetch(
					`${baseURL}/kline/getKlineStream`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							symbol,
							interval,
						}),
					}
				)

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				reader =
					response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
				if (!reader) {
					throw new Error('No response body')
				}

				while (isSubscribed) {
					const { done, value } = await reader.read()
					if (done) break

					const text = new TextDecoder().decode(value)
					const lines = text.split('\n').filter((line) => line.trim())

					for (const line of lines) {
						try {
							if (line.startsWith('data: ')) {
								const jsonStr = line.slice(6) // 移除 "data: " 前缀
								const data = JSON.parse(
									jsonStr
								) as KlineResponse

								if (
									isSubscribed &&
									currentIntervalRef.current === interval
								) {
									const convertedData =
										convertToKLineData(data)

									setKlineData((prevData) => {
										// 如果没有数据，直接设置
										if (prevData.length === 0) {
											return convertedData
										}

										// 创建一个新的数组，保持原有数据不变
										const updatedData = [...prevData]

										// 处理新数据
										for (const newKline of convertedData) {
											// 查找是否存在相同时间戳的数据
											const existingIndex =
												updatedData.findIndex(
													(k) =>
														k.timestamp ===
														newKline.timestamp
												)

											if (existingIndex !== -1) {
												// 如果存在相同时间戳，更新该数据
												updatedData[existingIndex] =
													newKline
											} else {
												// 如果不存在，找到正确的插入位置（保持时间顺序）
												let insertIndex =
													updatedData.length
												for (
													let i =
														updatedData.length - 1;
													i >= 0;
													i--
												) {
													if (
														updatedData[i]
															.timestamp <
														newKline.timestamp
													) {
														insertIndex = i + 1
														break
													}
												}
												updatedData.splice(
													insertIndex,
													0,
													newKline
												)
											}
										}

										return updatedData
									})
								}
							}
						} catch (err) {
							console.error('Error parsing SSE data:', err)
						}
					}
				}
			} catch (err) {
				if (isSubscribed) {
					setError(
						err instanceof Error
							? err.message
							: 'Failed to connect to stream'
					)
					console.error('Stream error:', err)
				}
			} finally {
				// 清理 reader
				if (reader) {
					try {
						await reader.cancel()
					} catch (err) {
						console.error('Error canceling reader:', err)
					}
				}
			}
		}

		fetchStream()

		return () => {
			isSubscribed = false
			// 在清理函数中也尝试关闭 reader
			if (reader) {
				reader.cancel().catch(console.error)
			}
		}
	}, [symbol, interval])

	useEffect(() => {
		setKlineData([])
		setError(null)
	}, [symbol])

	return {
		klineData,
		error,
		currentInterval: currentIntervalRef.current,
	}
}
