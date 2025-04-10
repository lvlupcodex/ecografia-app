document.addEventListener("DOMContentLoaded", () => {
    const audioInput = document.getElementById("audioInput");
    const uploadBtn = document.getElementById("uploadBtn");
    const submitBtn = document.getElementById("submitBtn");
    const toast = document.getElementById("toast");
  
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
  
    uploadBtn.addEventListener("click", () => {
      audioInput.click();
    });
  
    audioInput.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];
  
      if (selectedFile) {
        //SI EL BOTONCITO ESTÁ MAL Y ES MUY GRANDE
        if (selectedFile.size > 25 * 1024 * 1024) {
          showToast("Archivo demasiado grande (máx. 25MB)");
          selectedFile = null;
          submitBtn.classList.add("hidden");
          uploadBtn.classList.remove("hidden");
        } else {
          //ELSE EL BOTONCITO ESTÁ BIEN Y TIENE EL TAMAÑO DE > 25MB TODO BIEN
          showToast(`Archivo cargado: ${selectedFile.name}`);
          submitBtn.classList.remove("hidden");
          uploadBtn.classList.add("hidden");
        }
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
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
  
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
        console.error(err);
        showToast("- X - Error de red o conexión");
      }
    });
  });
  