export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, "");
      if (encoded.length % 4 > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const calcTimeLine = (id) => {
  const startSecond = (id * 30) % 60;
  const startMinute = Math.floor((id * 30) / 60) % 60;
  const startHour = Math.floor((id * 30) / 3600);

  const endSecond = (id * 30 + 40) % 60;
  const endMinute = Math.floor((id * 30 + 40) / 60) % 60;
  const endHour = Math.floor((id * 30 + 40) / 3600);

  const formatTime = (hour, minute, second) => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}:${String(second).padStart(2, "0")}`;
  };

  return `${formatTime(startHour, startMinute, startSecond)} - ${formatTime(
    endHour,
    endMinute,
    endSecond
  )}`;
};
