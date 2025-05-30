export const formatTimeAgo = (timestamp: number): string => {
	const now = Date.now()
	const diffInSeconds = Math.floor((now - timestamp) / 1000)

	if (diffInSeconds < 60) {
		return `${diffInSeconds}s ago`
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60)
	if (diffInMinutes < 60) {
		return `${diffInMinutes}min ago`
	}

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) {
		return `${diffInHours}h ago`
	}

	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays < 30) {
		return `${diffInDays}d ago`
	}

	const diffInMonths = Math.floor(diffInDays / 30)
	if (diffInMonths < 12) {
		return `${diffInMonths}mo ago`
	}

	const diffInYears = Math.floor(diffInMonths / 12)
	return `${diffInYears}y ago`
}
