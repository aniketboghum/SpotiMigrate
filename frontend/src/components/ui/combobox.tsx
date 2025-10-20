"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

type Playlist = {
  id : string;
  name : string
}

interface ComboboxProps {
  playlists: Playlist[];
  selectedPlaylistId: string;
  selectedPlaylistName: string;
  setSelectedPlaylistName:  React.Dispatch<React.SetStateAction<string>>;
  setSelectedPlaylistId: React.Dispatch<React.SetStateAction<string>>;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {props.selectedPlaylistId
            ? props.playlists.find((playlist) => playlist.id === props.selectedPlaylistId)?.name
            : "Select Playlist..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Playlists..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Playlist found.</CommandEmpty>
            <CommandGroup>
              {props.playlists.map((playlist) => (
                <CommandItem
                  key={playlist.id}
                  value={playlist.id}
                  onSelect={(currentValue) => {
                    props.setSelectedPlaylistId(currentValue)
                    props.setSelectedPlaylistName(playlist.name)
                    setOpen(false)
                  }}
                >
                  {playlist.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      props.selectedPlaylistId === playlist.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
