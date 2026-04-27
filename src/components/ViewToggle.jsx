import { LayoutGrid, Table } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs.jsx'

export function ViewToggle({ value, onChange }) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        <TabsTrigger value="cards">
          <LayoutGrid className="h-3.5 w-3.5" /> 卡片
        </TabsTrigger>
        <TabsTrigger value="table">
          <Table className="h-3.5 w-3.5" /> 表格
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
