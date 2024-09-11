import { useState } from "react";
import { Button } from "@/components/ui/button";

const DeleteEvent = () => {
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-semibold">
              Are you sure you want to delete
            </h2>
            <p>
              Please make sure you are happy to permanently delete this event{" "}
            </p>
            <Button onClick={handleCloseModal}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteEvent;
