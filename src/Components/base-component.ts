export default abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
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
