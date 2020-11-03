window.onload = async () => {
  const data = await fetch("data.xml");
  const text = await data.text();

  const parser = new DOMParser();
  const dom = parser.parseFromString(text, "application/xml");

  const xmlStudents = dom.getElementsByTagName("students")[0].children;
  const students = [];

  for (const student of xmlStudents) {
    const faculty = getXmlContent(student, "faculty");
    const course = getXmlContent(student, "course");
    const group = getXmlContent(student, "group");
    const name = getXmlContent(student, "name");
    const scores = {};
    const xmlScores = student.getElementsByTagName("scores")[0].children;
    for (const score of xmlScores) {
      const name = getXmlContent(score, "name");
      const value = getXmlContent(score, "score");
      scores[name] = value;
    }

    students.push(new Student(faculty, course, group, name, scores));
  }

  const groups = document.querySelector("#groups");
  const names = document.querySelector("#names");
  const faculty = document.querySelector("#faculty");
  const course = document.querySelector("#course");
  const nullify = document.querySelector("#nullify");

  updateGroups(students);
  updateStudents(students, groups.value);
  faculty.value = students.find((x) => x.group == groups.value).faculty;
  course.value = students.find((x) => x.group == groups.value).course;
  const student = students.find((x) => x.name == names.value);
  updateData(student);

  groups.addEventListener("change", () => {
    faculty.value = students.find((x) => x.group == groups.value).faculty;
    course.value = students.find((x) => x.group == groups.value).course;
    updateStudents(students, groups.value);
    const student = students.find((x) => x.name == names.value);
    updateData(student);
  });

  names.addEventListener("change", () => {
    const student = students.find((x) => x.name == names.value);
    updateData(student);
  });

  nullify.addEventListener("click", () => {
	const student = students.find((x) => x.name == names.value);
    updateData(student);
  });
};

function getXmlContent(dom, name) {
  return dom.getElementsByTagName(name)[0].textContent;
}

function updateGroups(students) {
  const groups = document.getElementById("groups");
  new Set(students.map((x) => x.group)).forEach((x) => {
    const option = document.createElement("option");
    option.textContent = x;
    option.value = x;
    groups.appendChild(option);
  });
}

function updateStudents(students, group) {
  const names = document.getElementById("names");
  names.innerHTML = "";
  students
    .filter((x) => x.group == group)
    .map((x) => x.name)
    .forEach((x) => {
      const option = document.createElement("option");
      option.textContent = x;
      option.value = x;
      names.appendChild(option);
    });
}

function updateData(student) {
  const data = document.getElementById("data");
  const header = data.firstElementChild;
  data.innerHTML = "";
  data.appendChild(header);

  for (const name in student.scores) {
    const value = student.scores[name];
    const row = document.createElement("tr");
    const title = document.createElement("td");
    title.innerText = name;
    const scores = new Array(3)
      .fill(0)
      .map((x) => document.createElement("td"));
    scores.forEach((x) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      x.appendChild(radio);
    });
    scores[+value].firstElementChild.checked = true;

    row.appendChild(title);
    scores.forEach((x) => {
      row.appendChild(x);
    });

    data.appendChild(row);
  }

  const avg = document.getElementById("average");
  avg.textContent = student.getAverageScore().toFixed(2);
}

class Student {
  constructor(faculty, course, group, name, scores) {
    this.faculty = faculty;
    this.course = course;
    this.group = group;
    this.name = name;
    this.scores = scores;
  }

  getAverageScore() {
    let total = 0;
    for (const score of Object.values(this.scores)) {
      total += +score;
    }

    return total / Object.keys(this.scores).length;
  }
}
