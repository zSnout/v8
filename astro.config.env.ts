// @ts-check

import type { Parent, PhrasingContent } from "mdast"

export interface Element extends Parent {
  type: "element"
  tagName: string
  properties: Record<string, ["contains-task-list"] | {}>
}

export interface TaskListLi {
  type: "element"
  tagName: "li"
  properties: {
    className: ["task-list-item"]
  }
  children: [
    {
      type: "element"
      tagName: "input"
      properties: {
        type: "checkbox"
        checked?: boolean
        disabled: true
      }
      children: []
    },
    ...PhrasingContent[],
  ]
}

export type TaskListChild = TaskListLi | { type: "text"; value: "\n" }

export interface TaskList extends Element {
  type: "element"
  tagName: "ul"
  properties: {
    className: ["contains-task-list"]
  }
  children: TaskListChild[]
}

declare module "mdast" {
  interface StaticPhrasingContentMap {
    element: Element
    taskList: TaskList
    taskListLi: TaskListLi
  }
}
