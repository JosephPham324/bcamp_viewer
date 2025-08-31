function renderWorkoutTable(dayIndex, workout, weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
  const wrapper = document.createElement("div");
  wrapper.className = "workout-card";
  wrapper.dataset.json = JSON.stringify(workout);

  // Store JSON for debugging
  const jsonText = JSON.stringify(workout, null, 2);

  const header = document.createElement("div");
  header.className = "d-flex align-items-center justify-content-between";

  const title = document.createElement("h5");
  title.textContent = `Day ${dayIndex + 1} (${weekdayNames[dayIndex]})`;

  // 🔹 Debug icon
  const debugIcon = document.createElement("span");
  debugIcon.textContent = "❓";
  debugIcon.style.cursor = "pointer";
  debugIcon.style.color = "#0d6efd"; // Bootstrap primary blue
  debugIcon.title = "Hover to view JSON <button class='btn btn-sm btn-outline-primary copy-json'>Copy content</button>"; // fallback tooltip

  // Use Bootstrap tooltip with <pre> block
  debugIcon.setAttribute("data-bs-toggle", "popover");
  debugIcon.setAttribute("data-bs-html", "true");
  debugIcon.setAttribute("data-bs-trigger", "click"); // click to toggle
  debugIcon.setAttribute(
    "data-bs-content",
    `
    <div style="width:50vw;max-height:80vh;overflow:auto;">
      <pre style="white-space:pre-wrap;font-size:0.75rem;">${jsonText}</pre>
    </div>
  `
  );

  header.appendChild(title);
  header.appendChild(debugIcon);
  wrapper.appendChild(header);

  const table = document.createElement("table");
  table.className = "table workout-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `
      <tr>
        <th style="width: 30px">#</th>
        <th>Exercise</th>
        <th>Sets</th>
        <th>Reps</th>
        <th>Intensity</th>
      </tr>
    `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  console.log(workout.exercises);
  const renderWorkout = (workout) => {
    // const tbody = document.querySelector("#exercise-table tbody");
    tbody.innerHTML = "";

    // Helper to render a single exercise or superset group
    const renderExercise = (exercise, idx, supersetLabel = null) => {
      const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

      // Title row
      const titleRow = document.createElement("tr");
      const labelCol = supersetLabel ? `${idx + 1}${supersetLabel}` : idx + 1;
      titleRow.innerHTML = `
        <td class="text-orange">${labelCol}</td>
        <td class="exercise-name" colspan="4">${exercise.name || "Unknown"}</td>
      `;
      tbody.appendChild(titleRow);

      // Render grouped set lines
      if (sets.length > 0) {
        // Group similar sets
        const grouped = [];
        for (let i = 0; i < sets.length; i++) {
          const curr = sets[i];
          const prev = grouped[grouped.length - 1];
          if (
            prev &&
            curr.target === prev.target &&
            curr.target_min === prev.target_min &&
            curr.target_max === prev.target_max &&
            curr.target_type === prev.target_type &&
            curr.intensity_unit === prev.intensity_unit
          ) {
            prev.count++;
          } else {
            grouped.push({ ...curr, count: 1 });
          }
        }

        grouped.forEach((set) => {
          const reps =
            set.target_type === "reps_range"
              ? `${set.target_min}-${set.target_max} reps`
              : `${set.target}${set.target_type === "reps_max" ? "+" : ""} reps`;
          const intensity = set.intensity !== undefined ? (set.intensity_unit === "%" ? `${set.intensity}%` : `RPE ${set.intensity}`) : "-";

          const subRow = document.createElement("tr");
          subRow.innerHTML = `
            <td></td>
            <td></td>
            <td>${set.count}</td>
            <td>${reps}</td>
            <td>${intensity}</td>
          `;
          tbody.appendChild(subRow);
        });
      }
    };

    workout.exercises.forEach((exercise, idx) => {
      // If this exercise has supersets, render each superset
      if (Array.isArray(exercise.supersets) && exercise.supersets.length > 0) {
        exercise.supersets.forEach((sup, sidx) => {
          // Label subs as A, B, etc. for supersets
          const letter = String.fromCharCode(65 + sidx);
          renderExercise(sup, idx, letter);
        });
      } else {
        renderExercise(exercise, idx);
      }
    });
  };
  renderWorkout(workout);
  //   (workout.exercises || []).forEach((exercise, idx) => {
  //     const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

  //     const isUniformSets =
  //       sets.length > 0 &&
  //       sets.every(
  //         (s) =>
  //           s?.target === sets[0]?.target &&
  //           s?.intensity === sets[0]?.intensity &&
  //           s?.target_type === sets[0]?.target_type &&
  //           s?.intensity_unit === sets[0]?.intensity_unit
  //       );

  //     const titleRow = document.createElement("tr");
  //     titleRow.innerHTML = `
  //       <td class="text-orange">${idx + 1}</td>
  //       <td class="exercise-name" colspan="4">${exercise.name || "Unknown"}</td>
  //     `;
  //     tbody.appendChild(titleRow);

  //     // Group sets (either way)
  //     if (sets.length > 0) {
  //       let grouped = [];
  //       for (let i = 0; i < sets.length; i++) {
  //         const current = sets[i];
  //         const prev = grouped[grouped.length - 1];

  //         if (
  //           prev &&
  //           current.target === prev.target &&
  //           current.intensity === prev.intensity &&
  //           current.target_type === prev.target_type &&
  //           current.intensity_unit === prev.intensity_unit
  //         ) {
  //           prev.count += 1;
  //         } else {
  //           grouped.push({ ...current, count: 1 });
  //         }
  //       }

  //       grouped.forEach((set) => {
  //         const reps =
  //           set.target_type === "reps_range"
  //             ? `${set.target_min ?? "?"}-${set.target_max ?? "?"} reps`
  //             : `${set.target ?? "?"}${set.target_type === "reps_max" ? "+" : ""} reps`;

  //         const intensity = set.intensity !== undefined ? (set.intensity_unit === "%" ? `${set.intensity}%` : `RPE ${set.intensity}`) : "-";

  //         const sub = document.createElement("tr");
  //         sub.innerHTML = `
  //           <td></td>
  //           <td></td>
  //           <td>${set.count}</td>
  //           <td>${reps}</td>
  //           <td>${intensity}</td>
  //         `;
  //         tbody.appendChild(sub);
  //       });
  //     }
  //   });
  table.appendChild(tbody);
  wrapper.appendChild(table);

  setTimeout(() => {
    const popover = new bootstrap.Popover(debugIcon, {
      html: true,
      sanitize: false,
      container: "body",
      placement: "right",
    });

    // Delegate copy button click
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("copy-json")) {
        navigator.clipboard.writeText(jsonText).then(() => {
          e.target.textContent = "Copied!";
          setTimeout(() => (e.target.textContent = "Copy"), 2000);
        });
      }
    });
  }, 0);

  return wrapper;
}

document.getElementById("form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const url = document.getElementById("url").value;
  const error = document.getElementById("error");
  const container = document.getElementById("program-container");
  error.textContent = "";
  container.style.display = "none";
  document.querySelectorAll(".mt-5.tablesContainer").forEach((el) => {
    el.remove();
  });

  try {
    const workerUrl = "https://my-proxy.quangnhatpham-dev.workers.dev";
    const targetUrl = encodeURIComponent(url);

    const res = await fetch(`${workerUrl}?url=${targetUrl}`);

    if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const script = doc.querySelector("script#__NEXT_DATA__");
    if (!script) throw new Error('No script with id "__NEXT_DATA__" found');

    const json = JSON.parse(script.textContent);
    const data = json.props?.pageProps?.programData;
    if (!data) throw new Error("programData not found");

    document.getElementById("program-banner").src = data.banner;
    document.getElementById("program-title").textContent = data.title;
    document.getElementById("program-tagline").textContent = data.tagline;

    document.getElementById("program-description").innerHTML = data.short_description || "<p>No description available.</p>";

    const goalsList = document.getElementById("program-goals");
    goalsList.innerHTML = "";
    data.goals.forEach((goal) => {
      const li = document.createElement("li");
      li.textContent = goal;
      li.className = "list-group-item";
      goalsList.appendChild(li);
    });

    const diffList = document.getElementById("program-difficulties");
    diffList.innerHTML = "";
    data.difficulties.forEach((diff) => {
      const li = document.createElement("li");
      li.textContent = diff;
      li.className = "list-group-item";
      diffList.appendChild(li);
    });

    document.getElementById("program-slug").textContent = data.slug;

    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const tablesContainer = document.createElement("div");
    tablesContainer.classList = "mt-5 tablesContainer";

    const variations = data.variations || [];
    if (!Array.isArray(variations)) {
      tablesContainer.innerHTML = `<p class="text-danger">No variations found in this program.</p>`;
      document.getElementById("program-container").appendChild(tablesContainer);
      return;
    }

    for (let i = 0; i < variations.length; i++) {
      let variation = variations[i];
      const tableTitle = document.createElement("h3");
      tableTitle.className = "mb-3 mt-5";
      tableTitle.textContent = `Variation: ${variation.name || "Unnamed"}`;
      tablesContainer.appendChild(tableTitle);

      const table = document.createElement("table");
      table.className = "table table-bordered table-striped align-middle text-center";
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      const headRow = document.createElement("tr");
      headRow.innerHTML = `<th style="min-width:120px">Day</th>`;

      variation.weeks.forEach((week) => {
        const th = document.createElement("th");
        th.innerHTML = `${week.title}<br><small class="text-muted">${week.subTitle}</small>`;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);

      variation.weekdays.forEach((weekday, dayIndex) => {
        const row = document.createElement("tr");
        const dayName = weekdayNames[weekday];
        const dayCell = document.createElement("td");
        dayCell.textContent = dayName;
        dayCell.className = "fw-bold text-start";
        row.appendChild(dayCell);

        variation.weeks.forEach((_, weekIndex) => {
          const cell = document.createElement("td");
          const workout = variation.workouts.find((w) => w.week === weekIndex && w.day === dayIndex);
          cell.style.verticalAlign = "top";
          cell.style.textAlign = "left";

          if (workout?.exercises?.length) {
            const renderedWorkout = renderWorkoutTable(workout.day, workout);
            cell.appendChild(renderedWorkout);
          } else {
            cell.innerHTML = `<em class="text-muted">No workout</em>`;
          }

          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      tablesContainer.appendChild(table);
    }

    document.getElementById("program-container").appendChild(tablesContainer);
    document.getElementById("program-container").style.display = "block";

    //#endregion
    container.style.display = "block";
  } catch (err) {
    error.textContent = "Error: " + err.message;
    throw err;
  }
});
document.getElementById("exportExcel").addEventListener("click", function () {
  try {
    const wb = XLSX.utils.book_new();

    const workoutCards = document.querySelectorAll(".workout-card");
    if (!workoutCards.length) {
      alert("No workouts to export!");
      return;
    }

    const sessions = [];
    workoutCards.forEach((card) => {
      const json = card.dataset.json ? JSON.parse(card.dataset.json) : null;
      if (json) sessions.push(json);
    });

    if (!sessions.length) {
      alert("No JSON data found in cards");
      return;
    }

    // Group by week → day
    const weeksMap = {};
    sessions.forEach((s) => {
      if (!weeksMap[s.week]) weeksMap[s.week] = {};
      weeksMap[s.week][s.day] = s;
    });

    const aoa = [];
    let currentRow = 0;

    Object.keys(weeksMap)
      .sort((a, b) => a - b)
      .forEach((weekNum) => {
        const days = weeksMap[weekNum];
        const dayKeys = Object.keys(days).sort((a, b) => a - b);

        // Week title row
        aoa[currentRow++] = [`=== Week ${parseInt(weekNum) + 1} ===`];

        dayKeys.forEach((dayNum) => {
          const session = days[dayNum];

          // --- Session title row ---
          aoa[currentRow++] = [`Day ${parseInt(session.day) + 1}`];

          // --- Header row ---
          aoa[currentRow] = ["#", "Exercise", "Sets", "Reps", "Intensity", "Note"];
          currentRow++;

          // --- Exercises rows ---
          session.exercises.forEach((ex, idx) => {
            const sets = ex.sets?.length || 0;
            let reps = "-";
            let intensity = "-";
            if (ex.sets?.length) {
              const st = ex.sets[0];
              reps =
                st.target_type === "reps_range" ? `${st.target_min}-${st.target_max}` : `${st.target}${st.target_type === "reps_max" ? "+" : ""}`;
              intensity = st.intensity !== undefined ? (st.intensity_unit === "%" ? `${st.intensity}%` : `RPE ${st.intensity}`) : "-";
            }

            aoa[currentRow++] = [
              idx + 1, // #
              ex.name, // Exercise
              sets, // Sets
              reps, // Reps
              intensity, // Intensity
              ex.notes || "", // Note
            ];
          });

          // Blank row after each session
          aoa[currentRow++] = [];
        });

        // Extra blank row after each week
        aoa[currentRow++] = [];
      });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        ws[cell_ref].s = {
          border: {
            top: { style: "thin", color: "#000" },
            bottom: { style: "thin", color: "#000" },
            left: { style: "thin", color: "#000" },
            right: { style: "thin", color: "#000" },
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Program");

    XLSX.writeFile(wb, "program_export.xlsx");
  } catch (err) {
    console.error(err);
    alert("Export failed: " + err.message);
  }
});
