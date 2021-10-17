import Component from "./base-component";
import SyncBinding from "../decorators/SyncBinding";
import { state } from "../store/state";
import { DragTarget, Project } from "../types/index";
import { ProjectStatus } from "../types/index";
import ProjectItem from "./item";

export default class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assingedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    // Drag Listeners
    this.mainEl.addEventListener("dragover", this.dragOverHandler);
    this.mainEl.addEventListener("dragleave", this.dragLeaveHandler);
    this.mainEl.addEventListener("drop", this.dropHandler);

    // Subscribing to state of project
    state.addSubscriber((projects: Project[]) => {
      this.assingedProjects = projects.filter((prj) => {
        if (this.type === "active") return prj.status === ProjectStatus.Active;
        else return prj.status === ProjectStatus.Finished;
      });

      this.renderProjects();
    });

    // Rendering
    this.mainEl.querySelector("ul")!.id = `${type}-projects-list`;
    this.mainEl.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const list = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    // Cleaning for rerender
    list.innerHTML = "";

    // Render list items
    for (const prj of this.assingedProjects) {
      new ProjectItem(this.mainEl.querySelector("ul")!.id, prj);
    }
  }

  @SyncBinding
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      event.stopPropagation();

      const listEl = this.mainEl.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @SyncBinding
  dropHandler(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const projecId = event.dataTransfer!.getData("text/plain");
    state.switchProject(
      projecId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @SyncBinding
  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const listEl = this.mainEl.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }
}
