import { useState } from "react";
import {
  fileToBase64,
  generateUUID,
  calcTimeLine,
} from "../../utils/fileUtils";
import axios from "axios";

const URL = "http://41.132.66.17:30911";

const UploadTranscribe = () => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uuId, setUuId] = useState("");
  const [textList, setTextList] = useState([]);
  const [position, setPosition] = useState(0);
  const [timeLine, setTimeLine] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [maxLength, setMaxLength] = useState(1000);

  const onPrev = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    if (timeLine == "") {
      alert("Please upload a file first");
      return;
    }

    if (position > 0) {
      const newTimeLine = calcTimeLine(position - 1);
      setTimeLine(newTimeLine);
      setText(textList[position - 1]);
      setPosition(position - 1);
    }
  };

  const onNext = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    if (timeLine == "") {
      alert("Please upload a file first");
      return;
    }

    console.log("OnNext", position, textList.length);
    const newTimeLine = calcTimeLine(position + 1);
    setTimeLine(newTimeLine);
    setPosition(position + 1);
    if (position < textList.length - 1) {
      setText(textList[position + 1]);
    } else {
      setProcessing(true);
      const resText = await getTranscribedText(position + 1);
      setTextList((prevTextList) => [...prevTextList, resText]);
      setText(resText);
      setProcessing(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

  const fileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    console.log("here");
    const audioString = await fileToBase64(selectedFile);

    const generatedUuId = generateUUID();
    setUuId(generatedUuId);
    console.log(uuId);

    const payload = {
      uu_id: generatedUuId,
      audio_string: audioString,
      time_step: 30,
    };

    try {
      const response = await axios.post(`${URL}/v1/upload`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      setUploading(false);
      if (response.status === 200) {
        setProcessing(true);
        const result = response.data;
        console.log(result);

        const resText = await getTranscribedText(0, generatedUuId);
        const newTimeLine = calcTimeLine(0);

        setTextList((prevTextList) => [...prevTextList, resText]);
        setText(resText);
        setTimeLine(newTimeLine);
        setProcessing(false);
      } else {
        console.error("Error transcribing audio.");
      }
    } catch (error) {
      // Handle the error
      setUploading(false);
      console.error("An error occurred:", error);
    }
  };

  const getTranscribedText = async (id, generatedUuId = "") => {
    console.log("getTranscribedText", id, maxLength);
    if (id == maxLength) {
      alert("This is the last text");
      return;
    }

    const payload = {
      uu_id: uuId == "" ? generatedUuId : uuId,
      id: id,
    };

    console.log(payload);
    try {
      const response = await axios.post(`${URL}/v1/transcribe`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response.status === 200) {
        if ("maxLength" in response.data) {
          setMaxLength(maxLength);
          alert("This is the last file.");
          return;
        }
        return response.data[`Part_${id}`];
      } else {
        // Handle any non-200 status codes as you see fit
        throw new Error("Non-200 status code received");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen  overflow-hidden py-6 sm:py-12">
      <img
        src="https://play.tailwindcss.com/img/beams.jpg"
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
      />

      <div className="max-w-[1440px] p-4 text-center relative z-10">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Speech to Text
        </h1>
        <div className="my-10">
          <input
            disabled={uploading || processing}
            className="w-1/2 cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            onChange={handleFileChange}
          />

          <button
            disabled={uploading || processing}
            type="button"
            className="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  items-center"
            onClick={fileUpload}
          >
            {uploading && (
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 mr-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <div className="bg-white min-h-[300px] px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-[720px] sm:rounded-lg sm:px-10">
          {processing && (
            <div className="relative inset-0 flex items-start justify-center bg-opacity-40 z-50 pointer-events-none">
              <div className="fixed">
                <svg
                  aria-hidden="true"
                  className="w-16 h-16 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          <h2 className="mr-2 rounded-full bg-green-100 px-2.5 py-0.5 text-lg font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
            {timeLine}
          </h2>
          <div className="mx-auto">
            <div className="divide-y divide-gray-300/50">
              <div className="space-y-6 py-8 text-base leading-7 text-gray-600">
                <p>{text}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            disabled={uploading || processing}
            type="button"
            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            onClick={onPrev}
          >
            Prev
          </button>
          <button
            disabled={uploading || processing}
            type="button"
            className="ml-10 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default UploadTranscribe;
