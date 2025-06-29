"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// borderRadius: 1 - radius none, 2 - radius left, 3 - radius right, 4 - radius full
export default function Combobox({ listData, placeholder, borderRadius, handleFunction, value }: {
    listData: any, placeholder: any, borderRadius: any, handleFunction: any, value?: any
}) {
    const [open, setOpen] = useState(false)
    const [borderRadiusValue, setBorderRadiusValue] = useState('')

    useEffect(() => {
        switch (borderRadius) {
            case 1:
                setBorderRadiusValue('lg:rounded-none')
                break;
            case 2:
                setBorderRadiusValue('lg:rounded-r-none')
                break;
            case 3:
                setBorderRadiusValue('lg:rounded-l-none')
                break;
            default:
                break;
        }
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full lg:w-[200px] justify-between h-12 hover:cursor-pointer ${borderRadiusValue}`}
                >
                    {value
                        ? listData.find((item: any) => item.value === value)?.label
                        : `${placeholder} `}
                    {/* Dấu X xoá chọn */}
                    {value && (
                        <span
                            className="ml-2 cursor-pointer"
                            onClick={e => {
                                e.stopPropagation();
                                handleFunction("");
                                setOpen(false);
                            }}
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full lg:w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={`Tìm ${placeholder}`} />
                    <CommandList>
                        <CommandEmpty>Không có dữ liệu</CommandEmpty>
                        <CommandGroup>
                            {listData?.map((item: any, index: any) => (
                                <CommandItem
                                    key={`${item.value}-${index}`}
                                    value={item.value}
                                    onSelect={() => {
                                        setOpen(false)
                                        handleFunction(item.value)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
