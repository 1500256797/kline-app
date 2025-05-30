import { useState, useEffect } from 'react'
import { baseURL } from '../config'

interface Asset {
	id: number
	name: string
	symbol: string
	is_nft: boolean
	token_address: string
	decimals: number
}

interface AssetsResponse {
	assets: Asset[]
}

interface UseAssetsProps {
	page?: number
	pageSize?: number
}

export const useAssets = ({ page = 0, pageSize = 10 }: UseAssetsProps = {}) => {
	const [assets, setAssets] = useState<Asset[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		const fetchAssets = async () => {
			try {
				setLoading(true)
				const response = await fetch(
					`${baseURL}/assets/getAssets?page=${page}&page_size=${pageSize}`,
					{
						method: 'GET',
						headers: {
							Accept: 'application/json',
						},
					}
				)

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data = (await response.json()) as AssetsResponse
				setAssets(data.assets)
				setError(null)
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to fetch assets'
				)
				console.error('Error fetching assets:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchAssets()
	}, [page, pageSize])

	const refetch = () => {
		setLoading(true)
		setError(null)
	}

	return {
		assets,
		loading,
		error,
		refetch,
	}
}
