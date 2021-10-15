// Drag and Drop interface
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// State management
type Listener = (item: Project[]) => void;

class ProjectState {
  private static instance: ProjectState;
  private projects: Project[];
  private subscribers: Listener[];

  private constructor() {
    this.projects = [];
    this.subscribers = [];
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  private callSubscribersFunctions() {
    for (const fn of this.subscribers) {
      fn(this.projects.slice());
    }
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Date.now().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.callSubscribersFunctions();
  }

  addSubscriber(listenerFn: Listener) {
    this.subscribers.push(listenerFn);
  }

  switchProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((el) => el.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.callSubscribersFunctions();
    }
  }
}

const state = ProjectState.getInstance();

// Validation
interface ValidationObj {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(confObj: ValidationObj) {
  let isValid = true;

  if (confObj.required) {
    isValid = isValid && confObj.value.toString().trim().length !== 0;
  }

  if (confObj.minLength != null && typeof confObj.value === "string") {
    isValid = isValid && confObj.value.length >= confObj.minLength;
  }
  if (confObj.maxLength != null && typeof confObj.value === "string") {
    isValid = isValid && confObj.value.length <= confObj.maxLength;
  }

  if (confObj.min != null && typeof confObj.value === "number") {
    isValid = isValid && confObj.value >= confObj.min;
  }
  if (confObj.max != null && typeof confObj.value === "number") {
    isValid = isValid && confObj.value <= confObj.max;
  }

  return isValid;
}

// Decorators
function SyncBinding(
  _1: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return {
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  };
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  targetEl: T;
  mainEl: U;

  constructor(
    templateId: string,
    targetId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.targetEl = document.getElementById(targetId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.mainEl = importedNode.firstElementChild as U;

    if (newElementId) this.mainEl.id = newElementId;

    this.targetEl.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.mainEl
    );
  }
}

class ProjectItem
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

class ProjectList
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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputEl = this.mainEl.querySelector("#title") as HTMLInputElement;
    this.descriptionInputEl = this.mainEl.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputEl = this.mainEl.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Submit Listener
    this.mainEl.addEventListener("submit", this.submitHandler);
  }

  private clearInputs() {
    this.titleInputEl.value = "";
    this.descriptionInputEl.value = "";
    this.peopleInputEl.value = "";
  }

  private removeErrorClass() {
    document.querySelector("#title")!.classList.remove("input-error");
    document.querySelector("#description")!.classList.remove("input-error");
    document.querySelector("#people")!.classList.remove("input-error");
  }

  private getFormInfo(): [string, string, number] | void {
    this.removeErrorClass();

    const titleVal = this.titleInputEl.value;
    const descVal = this.descriptionInputEl.value;
    const peopleVal = this.peopleInputEl.value;

    if (!validate({ value: titleVal, required: true })) {
      document.querySelector("#title")!.classList.add("input-error");
      return;
    }

    if (!validate({ value: descVal, required: true, minLength: 5 })) {
      document.querySelector("#description")!.classList.add("input-error");
      return;
    }

    if (!validate({ value: peopleVal, required: true, min: 1, max: 10 })) {
      document.querySelector("#people")!.classList.add("input-error");
      return;
    }

    return [titleVal, descVal, +peopleVal];
  }

  @SyncBinding
  private submitHandler(e: Event) {
    e.preventDefault();

    const userInput = this.getFormInfo();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      state.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList("active");
const finishedProjList = new ProjectList("finished");
