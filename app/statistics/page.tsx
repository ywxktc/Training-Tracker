'use client'

import useHistory from '@/hooks/useHistory'
import Loader from '@/components/Loader'
import History from '@/components/History'
import ProgressChart from '@/components/ProgressChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const Statistics = () => {
  const { history, isLoading, deleteTraining, clearHistory, addTraining } =
    useHistory()

  if (isLoading) {
    return <Loader />
  }

  const onClearHistory = () => {
    if (
      confirm(
        'Are you sure to clear the history? This action cannot be undone.'
      )
    ) {
      clearHistory()
    }
  }

  const onExportJson = () => {
    const json = JSON.stringify(history, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'history.json'
    a.click()
  }

  const onImportJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string
          const importedData = JSON.parse(json)

          // Validate that imported data is an array
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid data format: expected an array')
          }

          // Validate each item has required fields
          const isValid = importedData.every(
            (item) =>
              item &&
              typeof item.level === 'object' &&
              typeof item.startTime === 'number' &&
              typeof item.endTime === 'number' &&
              Array.isArray(item.problems) &&
              typeof item.performance === 'number'
          )

          if (!isValid) {
            throw new Error('Invalid data structure: missing required fields')
          }

          // Ask user for merge strategy
          if (
            confirm(
              `Found ${importedData.length} training sessions.\n\n` +
                'Choose merge strategy:\n' +
                '• Cancel: Keep current data\n' +
                '• OK: Replace all current data with imported data'
            )
          ) {
            // Clear current history and add imported training sessions
            clearHistory()
            importedData.forEach((training) => {
              addTraining(training)
            })
            alert(
              `Successfully imported ${importedData.length} training sessions!`
            )
          }
        } catch (error) {
          alert(
            `Import failed: ${error instanceof Error ? error.message : 'Invalid JSON file'}`
          )
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // 将 history 按时间升序排序，用于图表
  const sortedHistoryForChart = [...history].sort(
    (a, b) => a.startTime - b.startTime
  )

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-2xl font-bold'>Statistics</CardTitle>
        <div className='flex gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>Import/Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={onImportJson}
                className='cursor-pointer'
              >
                Import JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!history || history.length === 0}
                onClick={onExportJson}
                className='cursor-pointer'
              >
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem disabled>CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant='destructive' onClick={onClearHistory}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <>
            <div className='w-full mb-6'>
              <ProgressChart history={sortedHistoryForChart} />
            </div>
            <History history={history} deleteTraining={deleteTraining} />
          </>
        ) : (
          <div className='text-center py-4 text-muted-foreground'>
            No training history
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Statistics
