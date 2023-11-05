import Quill from "quill";

declare module "quill-image-resize-module-react" {
  class QuillImageResize {
    constructor(quill: Quill.Quill, options?: QuillImageResizeOptions);
  }

  interface QuillImageResizeOptions {
    modules: {
      imageResize: {
        displaySize?: boolean;
      };
    };
  }

  export { QuillImageResize, QuillImageResizeOptions };
}
