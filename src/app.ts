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

class ProjectList {
  templateEl: HTMLTemplateElement;
  rootEl: HTMLDivElement;
  sectionEl: HTMLElement;
  assingedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.templateEl = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.rootEl = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.sectionEl = importedNode.firstElementChild as HTMLElement;
    this.sectionEl.id = `${this.type}-projects`;

    // Subscribing to state of project
    state.addSubscriber((projects: Project[]) => {
      this.assingedProjects = projects;
      this.renderProjects();
    });

    // Injecting
    this.rootEl.insertAdjacentElement("beforeend", this.sectionEl);

    // Rendering
    this.sectionEl.querySelector("ul")!.id = `${type}-projects-list`;
    this.sectionEl.querySelector("h2")!.textContent =
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
      const liEl = document.createElement("li");
      liEl.textContent = prj.title;
      list.appendChild(liEl);
    }
  }
}

class ProjectInput {
  templateEl: HTMLTemplateElement;
  rootEl: HTMLDivElement;
  formEl: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.rootEl = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.formEl = importedNode.firstElementChild as HTMLFormElement;
    this.formEl.id = "user-input";

    this.titleInputEl = this.formEl.querySelector("#title") as HTMLInputElement;
    this.descriptionInputEl = this.formEl.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputEl = this.formEl.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Submit Listener
    this.formEl.addEventListener("submit", this.submitHandler);

    // Injecting
    this.rootEl.insertAdjacentElement("afterbegin", this.formEl);
  }

  private clearInputs() {
    this.titleInputEl.value = "";
    this.descriptionInputEl.value = "";
    this.peopleInputEl.value = "";
  }

  private getFormInfo(): [string, string, number] | void {
    const titleVal = this.titleInputEl.value;
    const descVal = this.descriptionInputEl.value;
    const peopleVal = this.peopleInputEl.value;

    if (
      validate({ value: titleVal, required: true }) &&
      validate({ value: descVal, required: true, minLength: 5 }) &&
      validate({ value: +peopleVal, required: true, min: 1, max: 5 })
    ) {
      return [titleVal, descVal, +peopleVal];
    } else {
      alert("Invalid input");
      return;
    }
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
