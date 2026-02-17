'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DemoResponse } from '@/lib/types/content'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<DemoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResponse(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('http://localhost:8000/api/demo/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data: DemoResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Upload File</h3>
          <p className="text-sm text-muted-foreground">
            Select a file for processing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="file" className="text-base font-medium">
              Select File
            </Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !file}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-5 h-5" />
                Upload and Process
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Response</h3>
          <p className="text-sm text-muted-foreground">
            JSON result from server
          </p>
        </div>

        {response ? (
          <div className="space-y-4">
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                response.success
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {response.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-medium">{response.message}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/0 via-muted/10 to-muted/10 pointer-events-none rounded-md" />
              <pre className="bg-muted p-6 rounded-md text-sm overflow-auto max-h-96 relative">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <Upload className="w-16 h-16 opacity-20" />
            <p className="text-sm">Upload a file to see JSON response</p>
          </div>
        )}
      </div>
    </div>
  )
}
