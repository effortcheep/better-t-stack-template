import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@better-t-stack-template/ui/components/combobox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@better-t-stack-template/ui/components/select"
import { type Column } from "@tanstack/react-table"
import * as React from "react"

type FacetedOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: FacetedOption[]
  /** 是否支持多选，默认 false（单选） */
  multiple?: boolean
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  if (multiple) {
    return (
      <MultiSelectCombobox
        column={column}
        title={title}
        options={options}
      />
    )
  }

  return (
    <SingleSelectFilter
      column={column}
      title={title}
      options={options}
    />
  )
}

/** 单选模式 — Select 组件 */
function SingleSelectFilter<TData, TValue>({
  column,
  title,
  options,
}: {
  column?: Column<TData, TValue>
  title?: string
  options: FacetedOption[]
}) {
  const selectedValue =
    (column?.getFilterValue() as string) ?? ""

  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => {
        column?.setFilterValue(
          value === "__all__" ? undefined : value,
        )
      }}
    >
      <SelectTrigger className="h-8 w-fit min-w-20 gap-1.5">
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          <SelectItem value="__all__">全部</SelectItem>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.icon && (
                <option.icon className="size-4 text-muted-foreground" />
              )}
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/** 多选模式 — Combobox 组件 */
function MultiSelectCombobox<TData, TValue>({
  column,
  title = "",
  options,
}: {
  column?: Column<TData, TValue>
  title?: string
  options: FacetedOption[]
}) {
  const filterValue =
    (column?.getFilterValue() as string[]) ?? []

  const optionMap = React.useMemo(() => {
    const map = new Map<string, FacetedOption>()
    for (const o of options) map.set(o.value, o)
    return map
  }, [options])

  const optionValues = React.useMemo(
    () => options.map((o) => o.value),
    [options],
  )

  const anchor = useComboboxAnchor()

  return (
    <Combobox
      items={optionValues}
      multiple
      value={filterValue}
      onValueChange={(value) => {
        const v = Array.isArray(value) ? value : []
        column?.setFilterValue(v.length ? v : undefined)
      }}
    >
      <ComboboxChips ref={anchor} className="h-8 min-h-8">
        <ComboboxValue>
          {filterValue.map((v) => {
            const opt = optionMap.get(v)
            return (
              <ComboboxChip key={v}>
                {opt?.label ?? v}
              </ComboboxChip>
            )
          })}
        </ComboboxValue>
        <ComboboxChipsInput
          placeholder={
            filterValue.length === 0 ? title : undefined
          }
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>未找到结果。</ComboboxEmpty>
        <ComboboxList>
          {(v) => {
            const opt = optionMap.get(v as string)
            return (
              <ComboboxItem
                key={v as string}
                value={v as string}
              >
                {opt?.icon && (
                  <opt.icon className="size-4 text-muted-foreground" />
                )}
                <span>{opt?.label ?? v}</span>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
