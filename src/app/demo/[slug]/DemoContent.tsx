'use client'

import { FileUploadDemo } from '@/components/demo/file-upload-demo'
import { SpbNetDemo } from '@/components/demo/spbnet-demo'

interface DemoContentProps {
  slug: string
}

export function DemoContent({ slug }: DemoContentProps) {
  return (
    <>
      {slug === 'file-upload-demo' && (
        <div className="mb-8">
          <FileUploadDemo />
        </div>
      )}

      {slug === 'spbnet' && (
        <div className="mb-8 w-full">
          <SpbNetDemo />
        </div>
      )}
    </>
  )
}
