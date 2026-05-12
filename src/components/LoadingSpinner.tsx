export default function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-surface-3 border-t-gold rounded-full animate-spin" />
      <span className="text-ink-muted text-sm">{text}</span>
    </div>
  )
}
