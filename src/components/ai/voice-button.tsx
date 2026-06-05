"use client"

import { Mic, Square } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  disabled?: boolean
  onRecorded: (blob: Blob) => void
}

/**
 * Кнопка hold-to-talk / tap-to-toggle: записывает audio/webm через
 * MediaRecorder и вызывает onRecorded по остановке.
 */
export function VoiceButton({ disabled, onRecorded }: Props) {
  const [recording, setRecording] = React.useState(false)
  const [denied, setDenied] = React.useState(false)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<BlobPart[]>([])

  const start = async () => {
    if (recording || disabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Gemini принимает audio/webm; opus — по умолчанию.
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : ""
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
        if (blob.size > 1024) onRecorded(blob)
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setDenied(false)
    } catch (e) {
      console.error("getUserMedia failed", e)
      setDenied(true)
    }
  }

  const stop = () => {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }

  const toggle = () => {
    if (recording) stop()
    else void start()
  }

  return (
    <Button
      type="button"
      variant={recording ? "destructive" : "outline"}
      size="icon"
      onClick={toggle}
      disabled={disabled}
      title={
        denied
          ? "Нет доступа к микрофону"
          : recording
            ? "Остановить запись"
            : "Голосовой ввод"
      }
      className={cn(recording && "animate-pulse")}
    >
      {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
    </Button>
  )
}
