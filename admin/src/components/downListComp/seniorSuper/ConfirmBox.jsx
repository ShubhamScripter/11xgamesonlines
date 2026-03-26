import React from "react";

function ConfirmBox({onClose, setConfirmResponse,confirmBoxtext }) {
  return (
    <div>
      <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)]  flex justify-center items-start pt-10 z-50 overflow-auto">
        <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
          <button
            onClick={onClose}
            className="absolute right-3 top-2 text-xl font-bold"
          >
            ✕
          </button>
          <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160] ">
            Block/Un-Block Match
          </h2>

          <div className="text-xl flex justify-center">
            {confirmBoxtext}
          </div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <button className="bg-[#ffcc2f] border border-[#cb8009] p-1 px-2 rounded-sm"
            onClick={() => {
              setConfirmResponse(true);
              onClose();
            }}
            >Confirm</button>
            <button className="bg-[#ffcc2f] border border-[#cb8009] p-1 px-2 rounded-sm"
            onClick={() => {
              setConfirmResponse(false);
              onClose();
            }}
            >Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmBox;
