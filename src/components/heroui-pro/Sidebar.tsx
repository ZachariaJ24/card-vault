"use client";

import React from "react";
import {
  Listbox,
  ListboxItem,
  ListboxSection,
  Tooltip,
  cn,
  type Selection,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export type SidebarItemDef = {
  key: string;
  title: string;
  icon?: string;
  href?: string;
  endContent?: React.ReactNode;
};

export type SidebarSectionDef = {
  key: string;
  title: string;
  items: SidebarItemDef[];
};

interface SidebarProps {
  sections: SidebarSectionDef[];
  selectedKey: string;
  isCompact?: boolean;
  onSelect?: (key: string) => void;
  className?: string;
}

export function Sidebar({ sections, selectedKey, isCompact, onSelect, className }: SidebarProps) {
  return (
    <Listbox
      as="nav"
      hideSelectedIcon
      className={cn("list-none", className)}
      classNames={{
        list: "items-center",
      }}
      color="default"
      itemClasses={{
        base: cn(
          "px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100",
          isCompact && "w-11 h-11 gap-0 p-0",
        ),
        title: cn(
          "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
        ),
      }}
      items={sections}
      selectedKeys={[selectedKey] as unknown as Selection}
      selectionMode="single"
      variant="flat"
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0];
        onSelect?.(key as string);
      }}
    >
      {(section) => (
        <ListboxSection
          key={section.key}
          classNames={{
            base: cn("w-full", isCompact && "p-0 max-w-[44px]"),
            group: cn(isCompact && "flex flex-col gap-1"),
            heading: cn(isCompact ? "hidden" : "text-tiny text-default-400 font-medium pl-3 mb-1"),
          }}
          showDivider={isCompact}
          title={section.title}
        >
          {section.items.map((item) => (
            <ListboxItem
              key={item.key}
              href={item.href}
              endContent={isCompact ? null : item.endContent}
              startContent={
                isCompact ? null : item.icon ? (
                  <Icon
                    className="text-default-500 group-data-[selected=true]:text-foreground"
                    icon={item.icon}
                    width={22}
                  />
                ) : null
              }
              textValue={item.title}
              title={isCompact ? null : item.title}
            >
              {isCompact ? (
                <Tooltip content={item.title} placement="right">
                  <div className="flex w-full items-center justify-center">
                    {item.icon && (
                      <Icon
                        className="text-default-500 group-data-[selected=true]:text-foreground"
                        icon={item.icon}
                        width={22}
                      />
                    )}
                  </div>
                </Tooltip>
              ) : null}
            </ListboxItem>
          ))}
        </ListboxSection>
      )}
    </Listbox>
  );
}
