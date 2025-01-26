import { useState, useCallback } from "react"
import { Toast, type ToastProps } from "./toast"

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, { title, description, variant, id: Date.now() }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return { toast, toasts, dismissToast }
}

