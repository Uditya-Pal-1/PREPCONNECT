import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Upload, FileText, Download, Trash2, AlertCircle } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface FileItem {
  id: string
  fileName: string
  fileType: 'resume' | 'notes' | 'test'
  uploadedAt: string
  size: number
  downloadUrl?: string
}

interface FileUploadProps {
  userId: string
}

export function FileUpload({ userId }: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) return

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/files/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (response.ok) {
        const { files } = await response.json()
        setFiles(files || [])
      }
    } catch (error) {
      console.log('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files only')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedFileType) {
      alert('Please select a file and file type')
      return
    }

    setUploading(true)
    try {
      const accessToken = localStorage.getItem('prepconnect_access_token')
      if (!accessToken) {
        alert('Please log in again')
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('fileType', selectedFileType)

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-78cb9030/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        alert('File uploaded successfully!')
        setSelectedFile(null)
        setSelectedFileType('')
        fetchFiles() // Refresh file list
      } else {
        const errorData = await response.json()
        alert(`Upload failed: ${errorData.error}`)
      }
    } catch (error) {
      console.log('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'resume': return 'bg-blue-100 text-blue-800'
      case 'notes': return 'bg-green-100 text-green-800'
      case 'test': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    return <FileText className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Files</h2>
        <p className="text-gray-600">
          Upload and manage your resumes, notes, and test materials
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New File</CardTitle>
          <CardDescription>
            Upload PDF, DOC, DOCX, TXT, JPG, or PNG files (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-gray-600">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-400">PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)</p>
              </div>
            )}
          </div>

          {/* File Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-type">File Type</Label>
              <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume/CV</SelectItem>
                  <SelectItem value="notes">Study Notes</SelectItem>
                  <SelectItem value="test">Test/Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedFileType || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            View and download your uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No files uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(file.fileType)}
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getFileTypeColor(file.fileType)} variant="secondary">
                          {file.fileType}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.downloadUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.downloadUrl, '_blank')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    ) : (
                      <div className="flex items-center text-sm text-gray-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Link expired
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}