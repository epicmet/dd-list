import { Project, Listener, ProjectStatus } from "../types/index";

export class ProjectState {
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

export const state = ProjectState.getInstance();
