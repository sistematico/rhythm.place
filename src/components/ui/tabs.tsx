'use client'

import React, { useState } from 'react'
import '@/styles/ui.scss'

type TabsProps = {
  children: React.ReactNode
  defaultValue?: string
  className?: string
}

type TabsContextType = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

export function Tabs({ children, defaultValue, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '')

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`tabs-list ${className}`}>{children}</div>
}

export function TabsTrigger({
  children,
  value,
  className = ''
}: {
  children: React.ReactNode
  value: string
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context)
    throw new Error('TabsTrigger must be used within a Tabs component')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

  return (
    <button
      className={`tabs-trigger ${
        isActive ? 'tabs-trigger-active' : ''
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  children,
  value,
  className = ''
}: {
  children: React.ReactNode
  value: string
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context)
    throw new Error('TabsContent must be used within a Tabs component')

  const { activeTab } = context
  const isActive = activeTab === value

  if (!isActive) return null

  return <div className={`tabs-content ${className}`}>{children}</div>
}
