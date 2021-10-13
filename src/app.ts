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
      this.clearInputs();
      console.log(title, desc, people);
    }
  }
}

const projInput = new ProjectInput();
