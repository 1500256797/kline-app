import { baseURL } from '../config'

interface Transaction {
	time: number
	tx_hash: string
	token_address: string
	symbol: string
	side: 'BUY' | 'SELL'
	raw_price: number
	price_decimals: number
	raw_amount: number
	amount_decimals: number
	raw_total: number
	total_decimals: number
	trader_address: string
}

interface TxResponse {
	txs: Transaction[]
}

export interface ProcessedTransaction {
	time: number
	tx_hash: string
	symbol: string
	side: 'BUY' | 'SELL'
	price: number
	amount: number
	total: number
	trader_address: string
}

const convertDecimalValue = (rawValue: number, decimals: number): number => {
	return rawValue / Math.pow(10, decimals)
}

const processTxData = (tx: Transaction): ProcessedTransaction => {
	return {
		time: tx.time,
		tx_hash: tx.tx_hash,
		symbol: tx.symbol,
		side: tx.side,
		price: convertDecimalValue(tx.raw_price, tx.price_decimals),
		amount: convertDecimalValue(tx.raw_amount, tx.amount_decimals),
		total: convertDecimalValue(tx.raw_total, tx.total_decimals),
		trader_address: tx.trader_address,
	}
}

const getTxList = async (symbol: string, page: number, pageSize: number) => {
	try {
		const response = await fetch(
			`${baseURL}/txs/getTxs?symbol=${symbol}&page=${page}&page_size=${pageSize}`,
			{
				method: 'GET',
				redirect: 'follow',
			}
		)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const result = (await response.json()) as TxResponse
		const processedTxs = result.txs.map(processTxData)
		return processedTxs
	} catch (err) {
		console.error('Fetch error:', err)
	}
}

export default getTxList
