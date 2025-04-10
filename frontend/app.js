document.addEventListener("DOMContentLoaded", () => {
  const audioInput = document.getElementById("audioInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const submitBtn = document.getElementById("submitBtn");
  const toast = document.getElementById("toast");
  const spinner = document.getElementById("spinner");
  const progressContainer = document.getElementById("progressBarContainer");
  const progressBar = document.getElementById("progressBar");

  let selectedFile = null;

  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add("show");
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hidden");
    }, duration);
  }

  function toggleSpinner(show) {
    if (show) {
      spinner.classList.remove("hidden");
    } else {
      spinner.classList.add("hidden");
    }
  }

  function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
  }

  function toggleProgressBar(show) {
    if (show) {
      progressContainer.classList.remove("hidden");
      updateProgress(0);
    } else {
      progressContainer.classList.add("hidden");
      updateProgress(0);
    }
  }

  uploadBtn.addEventListener("click", () => {
    audioInput.click();
  });

  audioInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
      const maxMB = 25;
      const allowedExtensions = [".mp3", ".m4a", ".wav", ".flac", ".ogg"];
      const fileName = selectedFile.name.toLowerCase();
      const isAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      const isSizeOK = selectedFile.size <= maxMB * 1024 * 1024;

      //SI EL BOTONCITO ESTÁ MAL Y ES MUY GRANDE
      if (!isSizeOK) {
        showToast("Archivo demasiado grande (máx. 25MB)");
        selectedFile = null;
        submitBtn.classList.add("hidden");
        uploadBtn.classList.remove("hidden");
        return;
      }

      if (!isAllowedExtension) {
        showToast("Formato no permitido (usa mp3, m4a, wav, flac u ogg)");
        selectedFile = null;
        submitBtn.classList.add("hidden");
        uploadBtn.classList.remove("hidden");
        return;
      }

      //ELSE EL BOTONCITO ESTÁ BIEN Y TIENE EL TAMAÑO DE > 25MB TODO BIEN
      showToast(`Archivo cargado: ${selectedFile.name}`);
      submitBtn.classList.remove("hidden");
      uploadBtn.classList.add("hidden");
    }
  });

  submitBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      showToast("No hay ningún archivo seleccionado.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    //Intenta meter, si no puedes, error 500 y lo que sea.
    try {
      toggleSpinner(true);
      toggleProgressBar(true);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/upload", true);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          updateProgress(percent);
        }
      });

      xhr.onload = () => {
        toggleSpinner(false);
        toggleProgressBar(false);

        try {
          const result = JSON.parse(xhr.responseText);
          if (result.error) {
            showToast(` - X - Error: ${result.error}`);
          } else {
            showToast("Informe enviado correctamente");
            selectedFile = null;
            audioInput.value = "";
            submitBtn.classList.add("hidden");
            uploadBtn.classList.remove("hidden");
          }
        } catch (err) {
          showToast(" - X - Respuesta inválida del servidor");
        }
      };

      xhr.onerror = () => {
        toggleSpinner(false);
        toggleProgressBar(false);
        showToast("- X - Error de red o conexión");
      };

      xhr.send(formData);

    } catch (err) {
      toggleSpinner(false);
      toggleProgressBar(false);
      console.error(err);
      showToast("- X - Error inesperado");
    }
  });
});