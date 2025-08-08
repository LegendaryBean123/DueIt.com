// Array to store all classes
let classes = [];
// Index of the currently selected class (not heavily used in this code)
let selectedClass = 0;
// Track the current view state (overview or calendar)
let currentView = 'overview'; 

// Main render function: displays all classes and their events in the center box
function render() {
  const center = document.getElementById("center-box");
  // If no classes, show a message
  if (classes.length === 0) {
    center.innerHTML = `<div style='color:#aaa;font-size:1.1em;'>No classes added. Click "Add Class" to begin.</div>`;
    return;
  }
  // Render each class and its events
  center.innerHTML = classes.map((cls, idx) => `
    <div class="class-box" data-idx="${idx}">
      <div class="class-title">
        <span class="class-name">${cls.name}</span>
        <div class="class-buttons">
          <!-- Color picker button and Add Event button for each class -->
          <button class="color-picker-btn" data-idx="${idx}" style="margin-right: 8px; background: ${cls.color || '#ccc'}; color: ${cls.color && isLight(cls.color) ? '#000' : '#fff'};">🎨</button>
          <button class="add-event-btn" data-idx="${idx}" style="background: ${cls.color || '#ccc'}; color: ${cls.color && isLight(cls.color) ? '#000' : '#fff'};">Add Event</button>
        </div>
      </div>
      <ul class="event-list">
        ${cls.events.map((ev, evIdx) => `
          <li class="event-item${ev.completed ? ' event-completed' : ''}" data-class-idx="${idx}" data-event-idx="${evIdx}">
            <div class="event-main">
              <input type="checkbox" class="event-check" ${ev.completed ? 'checked' : ''}>
              <span class="event-name">${ev.assignmentName}</span>
              <div class="event-dates">
                <span>Due: ${ev.dueDate} ${ev.dueTime}</span>
              </div>
            </div>
            <button class="event-delete-btn" title="Delete">&#10006;</button>
          </li>
        `).join("")}
      </ul>
    </div>
  `).join("");
  
  // Add event listeners for color picker buttons
  document.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      showColorPicker(idx);
    };
  });

  // Add event listeners for Add Event buttons
  document.querySelectorAll('.add-event-btn').forEach(btn => {
    btn.onclick = () => {
      let idx = Number(btn.dataset.idx);
      showEventDropdown(idx);
    };
  });

  // Add event listeners for event delete buttons
  document.querySelectorAll('.event-delete-btn').forEach(btn => {
    btn.onclick = (e) => {
      const li = btn.closest('.event-item');
      const classIdx = Number(li.getAttribute('data-class-idx'));
      const eventIdx = Number(li.getAttribute('data-event-idx'));
      // Remove the event from the class
      classes[classIdx].events.splice(eventIdx, 1);
      render();
    };
  });

  // Add event listeners for event checkboxes (mark as completed)
  document.querySelectorAll('.event-check').forEach(chk => {
    chk.onchange = (e) => {
      const li = chk.closest('.event-item');
      const classIdx = Number(li.getAttribute('data-class-idx'));
      const eventIdx = Number(li.getAttribute('data-event-idx'));
      // Toggle completed state
      classes[classIdx].events[eventIdx].completed = chk.checked;
      render();
    };
  });
}

// Show a popup to add a new class
function showClassDropdown() {
  let dropdown = document.createElement('div');
  // Style the dropdown
  dropdown.style.position = 'fixed';
  dropdown.style.top = '80px';
  dropdown.style.left = '50%';
  dropdown.style.transform = 'translateX(-50%)';
  dropdown.style.background = '#23243a';
  dropdown.style.color = '#fff';
  dropdown.style.border = '2px solid #3498db';
  dropdown.style.borderRadius = '10px';
  dropdown.style.padding = '24px 32px';
  dropdown.style.zIndex = 1000;
  dropdown.innerHTML = `
    <form>
      <label>Class Name:<br><input name='name' required style='width:220px;'></label><br><br>
      <button type='submit'>Add Class</button>
      <button type='button' class='close-btn'>Cancel</button>
    </form>
  `;
  document.body.appendChild(dropdown);
  // Close button handler
  dropdown.querySelector('.close-btn').onclick = () => dropdown.remove();
  // Form submit handler: add the class
  dropdown.querySelector('form').onsubmit = e => {
    e.preventDefault();
    let name = new FormData(e.target).get('name');
    classes.push({ name, events: [] });
    dropdown.remove();
    render();
  };
}

// Show a popup to add a new event/assignment to a class
function showEventDropdown(classIdx) {
  let dropdown = document.createElement('div');
  // Style the dropdown
  dropdown.style.position = 'fixed';
  dropdown.style.top = '120px';
  dropdown.style.left = '50%';
  dropdown.style.transform = 'translateX(-50%)';
  dropdown.style.background = '#23243a';
  dropdown.style.color = '#fff';
  dropdown.style.border = '2px solid #2ecc40';
  dropdown.style.borderRadius = '10px';
  dropdown.style.padding = '24px 32px';
  dropdown.style.zIndex = 1000;
  // Form for event details (assignment name, due date/time, type)
  dropdown.innerHTML = `
    <form>
      <label>Assignment/Test Name:<br><input name='assignmentName' type='text' required></label><br>
      <label>Due Date:<br>
        <select name='dueMonth' required>
          ${Array.from({ length: 12 }, (_, i) => {
            const currentMonth = new Date().getMonth() + 1;
            return `<option value='${(i + 1).toString().padStart(2, '0')}' ${i + 1 === currentMonth ? 'selected' : ''}>${(i + 1).toString().padStart(2, '0')}</option>`;
          }).join("")}
        </select> /
        <select name='dueDay' required>
          ${Array.from({ length: 31 }, (_, i) => {
            const currentDay = new Date().getDate();
            return `<option value='${(i + 1).toString().padStart(2, '0')}' ${i + 1 === currentDay ? 'selected' : ''}>${(i + 1).toString().padStart(2, '0')}</option>`;
          }).join("")}
        </select>
      </label><br>
      <label>Due Time:<br>
        <select name='dueHour' required>
          ${Array.from({ length: 12 }, (_, i) => {
            const currentHour = new Date().getHours() % 12 || 12;
            return `<option value='${(i + 1).toString().padStart(2, '0')}' ${(i + 1) === currentHour ? 'selected' : ''}>${(i + 1).toString().padStart(2, '0')}</option>`;
          }).join("")}
        </select> :
        <select name='dueMinute' required>
          ${Array.from({ length: 60 }, (_, i) => {
            const currentMinute = new Date().getMinutes();
            return `<option value='${i.toString().padStart(2, '0')}' ${i === currentMinute ? 'selected' : ''}>${i.toString().padStart(2, '0')}</option>`;
          }).join("")}
        </select>
        <select name='duePeriod' required>
          <option value='AM' ${new Date().getHours() < 12 ? 'selected' : ''}>AM</option>
          <option value='PM' ${new Date().getHours() >= 12 ? 'selected' : ''}>PM</option>
        </select>
      </label><br>
      <label>Type:<br>
        <select name='type' required>
          <option value='Formative'>Formative</option>
          <option value='Summative'>Summative</option>
          <option value='Assignment'>Assignment</option>
        </select>
      </label><br><br>
      <button type='submit'>Add Event</button>
      <button type='button' class='close-btn'>Cancel</button>
    </form>
  `;
  document.body.appendChild(dropdown);
  // Close button handler
  dropdown.querySelector('.close-btn').onclick = () => dropdown.remove();
  // Form submit handler: add the event to the class
  dropdown.querySelector('form').onsubmit = e => {
    e.preventDefault();
    let fd = new FormData(e.target);
    classes[classIdx].events.push({
      assignmentName: fd.get('assignmentName'),
      dueDate: `${fd.get('dueMonth')}-${fd.get('dueDay')}`,
      dueTime: `${fd.get('dueHour')}:${fd.get('dueMinute')} ${fd.get('duePeriod')}`,
      type: fd.get('type'),
      completed: false
    });
    dropdown.remove();
    render();
  };
}

// Show a popup to select and delete a class
function showDeleteDropdown() {
  if (classes.length === 0) {
    alert('No classes to delete!');
    return;
  }
  
  let dropdown = document.createElement('div');
  // Style the dropdown
  dropdown.style.position = 'fixed';
  dropdown.style.top = '80px';
  dropdown.style.left = '50%';
  dropdown.style.transform = 'translateX(-50%)';
  dropdown.style.background = '#23243a';
  dropdown.style.color = '#fff';
  dropdown.style.border = '2px solid #e74c3c';
  dropdown.style.borderRadius = '10px';
  dropdown.style.padding = '24px 32px';
  dropdown.style.zIndex = 1000;
  // List all classes as buttons for deletion
  dropdown.innerHTML = `
    <h3>Select Class to Delete:</h3>
    <div class="delete-class-list">
      ${classes.map((cls, idx) => `
        <button class="delete-class-item" data-idx="${idx}" style="
          display: block;
          width: 100%;
          margin: 8px 0;
          padding: 10px;
          background: ${cls.color || '#ccc'};
          color: ${cls.color && isLight(cls.color) ? '#000' : '#fff'};
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">${cls.name}</button>
      `).join('')}
    </div>
    <button type='button' class='close-btn' style="margin-top: 16px; background: #95a5a6; color: #fff; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Cancel</button>
  `;
  document.body.appendChild(dropdown);
  
  // Close button handler
  dropdown.querySelector('.close-btn').onclick = () => dropdown.remove();
  // Handler for each class delete button
  dropdown.querySelectorAll('.delete-class-item').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      classes.splice(idx, 1);
      dropdown.remove();
      render();
    };
  });
}

// Top bar button handlers: set up after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Class Overview - shows main class view
  document.getElementById("class-overview").onclick = () => {
    currentView = 'overview';
    render();
  };

  // Add Class button
  document.getElementById("add-class").onclick = () => {
    showClassDropdown();
  };

  // Delete Class button
  document.getElementById("delete-class").onclick = () => {
    showDeleteDropdown();
  };

  // Calendar View button
  document.getElementById("calendar-view").onclick = () => {
    currentView = 'calendar';
    renderCalendar();
  };
});

// Utility function: returns true if a hex color is "light" (for text color contrast)
function isLight(color) {
  const rgb = color.match(/\w\w/g).map(x => parseInt(x, 16));
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 155;
}

// Show a color picker popup for a class
function showColorPicker(classIdx) {
  const dropdown = document.createElement("div");
  // Style the color picker
  dropdown.style.position = "absolute";
  dropdown.style.background = "#fff";
  dropdown.style.border = "1px solid #ccc";
  dropdown.style.borderRadius = "5px";
  dropdown.style.padding = "10px";
  dropdown.style.display = "grid";
  dropdown.style.gridTemplateColumns = "repeat(4, 1fr)";
  dropdown.style.gap = "5px";
  dropdown.style.zIndex = "1000";

  // List of available colors
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#E74C3C",
    "#1ABC9C", "#2ECC71", "#3498DB", "#34495E", "#95A5A6", "#7F8C8D"
  ];

  // Handler to close picker when clicking outside
  function handleOutsideClick(e) {
    // If click is not inside dropdown and not on the color-picker-btn
    const button = document.querySelector(`.color-picker-btn[data-idx="${classIdx}"]`);
    if (!dropdown.contains(e.target) && e.target !== button) {
      dropdown.remove();
      document.removeEventListener("mousedown", handleOutsideClick, true);
    }
  }

  // Create a color box for each color
  colors.forEach(color => {
    const colorBox = document.createElement("div");
    colorBox.style.background = color;
    colorBox.style.width = "20px";
    colorBox.style.height = "20px";
    colorBox.style.borderRadius = "3px";
    colorBox.style.cursor = "pointer";
    colorBox.onclick = () => {
      classes[classIdx].color = color;
      dropdown.remove();
      document.removeEventListener("mousedown", handleOutsideClick, true);
      render();
    };
    dropdown.appendChild(colorBox);
  });

  document.body.appendChild(dropdown);
  // Position the color picker below the button
  const button = document.querySelector(`.color-picker-btn[data-idx="${classIdx}"]`);
  const rect = button.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + window.scrollY}px`;
  dropdown.style.left = `${rect.left + window.scrollX}px`;

  // Add event listener to close on outside click
  setTimeout(() => {
    document.addEventListener("mousedown", handleOutsideClick, true);
  }, 0);
}

// Render the calendar view, showing all events by due date
function renderCalendar() {
  const center = document.getElementById("center-box");
  center.innerHTML = "<div id='calendar'></div>";
  const calendar = document.getElementById("calendar");
  calendar.style.display = "grid";
  calendar.style.gridTemplateColumns = "repeat(7, 1fr)";
  calendar.style.gap = "10px";
  calendar.style.textAlign = "center";

  // Render day headers
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach(day => {
    const dayHeader = document.createElement("div");
    dayHeader.style.fontWeight = "bold";
    dayHeader.textContent = day;
    calendar.appendChild(dayHeader);
  });

  // Get current month/year info
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill in empty cells before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    calendar.appendChild(emptyCell);
  }

  // Render each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.textContent = day;
    dayCell.style.border = "1px solid #ccc";
    dayCell.style.padding = "5px";
    dayCell.style.borderRadius = "5px";

    // Gather all events due on this day
    const dayEvents = [];
    classes.forEach(cls => {
      cls.events.forEach(ev => {
        const [dueMonth, dueDay] = ev.dueDate.split("-").map(Number);
        if (dueMonth === month + 1 && dueDay === day) {
          const eventLabel = document.createElement("div");
          eventLabel.textContent = `${cls.name}: ${ev.assignmentName} (${ev.dueTime})`;
          eventLabel.style.fontSize = "0.8em";
          const bgColor = cls.color || "#f0f0f0";
          eventLabel.style.backgroundColor = bgColor;

          // Inline isLight function for color contrast
          const isLight = (color) => {
            const rgb = color.match(/\w\w/g).map(x => parseInt(x, 16));
            const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
            return brightness > 155;
          };

          eventLabel.style.color = isLight(bgColor) ? "#000" : "#fff";
          eventLabel.style.marginTop = "5px";
          eventLabel.style.borderRadius = "3px";
          eventLabel.style.padding = "2px 4px";
          dayEvents.push({ time: ev.dueTime, element: eventLabel });
        }
      });
    });

    // Sort events by time
    dayEvents.sort((a, b) => {
      const [aHour, aMinute, aPeriod] = a.time.split(/[: ]/);
      const [bHour, bMinute, bPeriod] = b.time.split(/[: ]/);
      const aTime = (parseInt(aHour) % 12 + (aPeriod === "PM" ? 12 : 0)) * 60 + parseInt(aMinute);
      const bTime = (parseInt(bHour) % 12 + (bPeriod === "PM" ? 12 : 0)) * 60 + parseInt(bMinute);
      return aTime - bTime;
    });

    // Add event labels to the day cell
    dayEvents.forEach(event => dayCell.appendChild(event.element));
    calendar.appendChild(dayCell);
  }
}

// Initial render on page load
render();
