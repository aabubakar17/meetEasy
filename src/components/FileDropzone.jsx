import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaRegFileImage } from "react-icons/fa6";

const FileDropzone = ({ setFile, className }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps({ className: className })}>
      <input {...getInputProps()} aria-label="image uploader" />
      {isDragActive ? (
        <div className="flex flex-col items-center justify-center">
          <FaRegFileImage className="h-12 w-12 " />
          <p className="text-sm font-medium text-gray-500">
            Drop the files here ...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <FaRegFileImage className="h-12 w-12 " />
          <p className="text-sm font-medium text-gray-500">
            Drag 'n' drop some files here, or click to select files
          </p>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
