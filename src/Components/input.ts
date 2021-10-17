import Component from "./base-component";
import { validate } from "../utils/validation";
import SyncBinding from "../decorators/SyncBinding";
import { state } from "../store/state";

export default class ProjectInput extends Component<
  HTMLDivElement,
  HTMLFormElement
> {
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
