import Component from "./base-component";
import SyncBinding from "../decorators/SyncBinding";
import { Draggable } from "../types/index";
import { Project } from "../types/index";

export default class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get peopleAmount() {
    if (this.project.people === 1) return "1 person";
    else return `${this.project.people} people`;
  }

  constructor(listId: string, project: Project) {
    super("single-project", listId, false, project.id);
    this.project = project;

    // Drag Listeners
    this.mainEl.addEventListener("dragstart", this.dragStartHandler);
    this.mainEl.addEventListener("dragend", this.dragEndHandler);

    // Rendering
    this.mainEl.querySelector("h2")!.textContent = this.project.title;
    this.mainEl.querySelector("h3")!.textContent =
      this.peopleAmount + " assigned";
    this.mainEl.querySelector("p")!.textContent = this.project.description;
  }

  @SyncBinding
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @SyncBinding
  dragEndHandler(_: DragEvent) {
    console.log("drag end");
  }
}
