"use client";
import "react-quill/dist/quill.bubble.css";
interface PreviewProps {
  content: string;
}
const Preview = ({ content }: PreviewProps) => {
  return (
    <div className="ql-container ql-bubble">
      <div className="ql-editor" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Preview;
