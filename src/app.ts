class ProjectInput {
  templateEl: HTMLTemplateElement;
  rootEl: HTMLDivElement;
  formEl: HTMLFormElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.rootEl = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.formEl = importedNode.firstElementChild as HTMLFormElement;
    this.formEl.id = "user-input";

    this.rootEl.insertAdjacentElement("afterbegin", this.formEl);
  }
}

const projInput = new ProjectInput();
