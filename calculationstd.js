// Get courseId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

if (!courseId) {
    alert("No course ID provided!");
    window.location.href = 'homecalc.html';
}

// Basic navigation functions
function goBack() {
    window.location.href = `assessmentplan.html?courseId=${courseId}`;
}

function goToFinalResult() {
    window.location.href = `finalresult.html?courseId=${courseId}`;
}

// Add these functions before firebase.auth().onAuthStateChanged
function loadAssessmentPlan(assessmentPlan) {
    if (!assessmentPlan) return;

    // Load formative assessments
    for (let i = 1; i <= 6; i++) {
        const assessment = assessmentPlan.formative[`assessment${i}`];
        if (assessment) {
            // Update name
            const nameCell = document.querySelector(`#formative-name-${i}`);
            if (nameCell) {
                nameCell.textContent = assessment.name || '-';
            }

            // Update total marks
            const marksCell = document.querySelector(`#formative-marks-${i}`);
            if (marksCell && assessment.marks) {
                const totalMarks = assessment.marks.reduce((sum, mark) => sum + Number(mark || 0), 0);
                marksCell.textContent = totalMarks;
            }

            // Update total weightage
            const weightageCell = document.querySelector(`#formative-weightage-${i}`);
            if (weightageCell && assessment.weightage) {
                const totalWeightage = assessment.weightage.reduce((sum, weight) => sum + Number(weight || 0), 0);
                weightageCell.textContent = totalWeightage;
            }
        }
    }

    // Load summative assessments
    for (let i = 1; i <= 2; i++) {
        const assessment = assessmentPlan.summative[`assessment${i}`];
        if (assessment) {
            // Update name
            const nameCell = document.querySelector(`#summative-name-${i}`);
            if (nameCell) {
                nameCell.textContent = assessment.name || '-';
            }

            // Update total marks
            const marksCell = document.querySelector(`#summative-marks-${i}`);
            if (marksCell && assessment.marks) {
                const totalMarks = assessment.marks.reduce((sum, mark) => sum + Number(mark || 0), 0);
                marksCell.textContent = totalMarks;
            }

            // Update total weightage
            const weightageCell = document.querySelector(`#summative-weightage-${i}`);
            if (weightageCell && assessment.weightage) {
                const totalWeightage = assessment.weightage.reduce((sum, weight) => sum + Number(weight || 0), 0);
                weightageCell.textContent = totalWeightage;
            }
        }
    }

    // Calculate total marks
    updateTotalMarks();
}

function updateTotalMarks() {
    let formativeTotal = 0;
    let summativeTotal = 0;

    // Sum formative marks
    for (let i = 1; i <= 6; i++) {
        const marksElement = document.querySelector(`#formative-marks-${i}`);
        formativeTotal += Number(marksElement?.textContent || 0);
    }
    
    // Sum summative marks
    for (let i = 1; i <= 2; i++) {
        const marksElement = document.querySelector(`#summative-marks-${i}`);
        summativeTotal += Number(marksElement?.textContent || 0);
    }

    // Update total marks display
    document.getElementById('total-marks-1').textContent = formativeTotal.toFixed(2);
    document.getElementById('total-marks-2').textContent = summativeTotal.toFixed(2);

    // Calculate total weightage
    let formativeWeightageTotal = 0;
    let summativeWeightageTotal = 0;

    // Sum formative weightage
    for (let i = 1; i <= 6; i++) {
        const weightageElement = document.querySelector(`#formative-weightage-${i}`);
        formativeWeightageTotal += Number(weightageElement?.textContent || 0);
    }
    
    // Sum summative weightage
    for (let i = 1; i <= 2; i++) {
        const weightageElement = document.querySelector(`#summative-weightage-${i}`);
        summativeWeightageTotal += Number(weightageElement?.textContent || 0);
    }

    // Update total weightage display
    document.getElementById('total-weightage-1').textContent = formativeWeightageTotal.toFixed(2);
    document.getElementById('total-weightage-2').textContent = summativeWeightageTotal.toFixed(2);
}

// Firebase auth and data loading
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        const promises = [
            firebase.database().ref('users/' + userId).once('value'),
            firebase.database().ref('courses/' + courseId).once('value'),
            firebase.database().ref('students').once('value'),
            firebase.database().ref('assessmentPlans/' + courseId).once('value'),
            firebase.database().ref('calculations/' + courseId).once('value'),
            firebase.database().ref(`courses/${courseId}/grading`).once('value') // Add grading scheme
        ];

        Promise.all(promises)
            .then(([userSnap, courseSnap, studentsSnap, planSnap, calcSnap, gradingSnap]) => {
                const userData = userSnap.val();
                const courseData = courseSnap.val();
                const students = studentsSnap.val();
                const assessmentPlan = planSnap.val();
                const calculations = calcSnap.val();

                // Load basic info
                if (userData) {
                    document.getElementById('Lecturer').innerText = userData.full_name;
                    document.getElementById('Faculty').innerText = userData.department;
                    document.getElementById('title').innerText = userData.title;
                }

                if (courseData) {
                    document.getElementById('coursename').innerText = courseData.courseName;
                    document.getElementById('courseid').innerText = courseData.courseId;
                    document.getElementById('Semester').innerText = courseData.semester || '';
                }

                // Add this line to load assessment plan
                loadAssessmentPlan(planSnap.val());

                // Store grading scheme globally
                window.gradingScheme = gradingSnap.val() || {
                    A: { min: 80, point: 4.00 },
                    A_MINUS: { min: 75, point: 3.67 },
                    B_PLUS: { min: 70, point: 3.33 },
                    B: { min: 65, point: 3.00 },
                    B_MINUS: { min: 60, point: 2.67 },
                    C_PLUS: { min: 55, point: 2.33 },
                    C: { min: 50, point: 2.00 },
                    C_MINUS: { min: 45, point: 1.67 },
                    D_PLUS: { min: 40, point: 1.33 },
                    D: { min: 35, point: 1.00 },
                    E: { min: 0, point: 0 }
                };

                // Display students table
                displayStudents(students, courseId, calculations);
            })
            .catch(error => {
                console.error("Error loading data:", error);
                alert("Error loading data: " + error.message);
            });
    }
});

// Basic display function
function displayStudents(students, courseId, calculations) {
    for (const studentId in students) {
        if (students[studentId].registeredCourses?.[courseId]) {
            const student = students[studentId];
            const previousCalc = calculations?.[student.stdid] || {};

            // Update student info
            document.getElementById('student-id').textContent = student.stdid || '';
            document.getElementById('student-name').textContent = student.name || '';
            document.getElementById('student-code').textContent = student.code || '';

            // Update formative marks
            for (let i = 1; i <= 6; i++) {
                document.getElementById(`formative-${i}`).textContent = 
                    previousCalc.formative?.[`assessment${i}`] || '0';
            }

            // Update summative marks
            for (let i = 1; i <= 2; i++) {
                document.getElementById(`summative-${i}`).textContent = 
                    previousCalc.summative?.[`assessment${i}`] || '0';
            }

            // Update totals and results
            document.getElementById('formative-subtotal').textContent = previousCalc.formativeTotal || '0';
            document.getElementById('formative-percent').textContent = previousCalc.formativePercent || '0';
            document.getElementById('summative-subtotal').textContent = previousCalc.summativeTotal || '0';
            document.getElementById('summative-percent').textContent = previousCalc.summativePercent || '0';
            document.getElementById('total-mark').textContent = previousCalc.totalMark || '0';
            document.getElementById('grade').textContent = previousCalc.grade || '-';
            document.getElementById('point').textContent = previousCalc.point || '0';
            document.getElementById('status').textContent = previousCalc.status || '-';

            break; // Only display first matching student
        }
    }
}

// Remove initializeCalculations function since we don't need input event listeners anymore

// Remove save functions since we're only displaying data

function calculateFormativeSubtotal(row) {
    const studentId = row.querySelector('.matric-number').textContent.trim();
    let formativeSubtotal = 0;
    
    // Sum formative inputs (1-6)
    for (let i = 1; i <= 6; i++) {
        const input = row.querySelector(`input[name="formative-${i}-${studentId}"]`);
        if (input) {
            formativeSubtotal += parseFloat(input.value || '0');
        }
    }
    
    // Update formative subtotal cell
    const formativeSubtotalCell = row.querySelector('.formative-subtotal');
    if (formativeSubtotalCell) {
        formativeSubtotalCell.textContent = formativeSubtotal.toFixed(2);
    }

    // Calculate and update formative percentage with weightage
    const totalMarks1 = parseFloat(document.getElementById('total-marks-1').textContent || '0');
    const totalWeightage1 = parseFloat(document.getElementById('total-weightage-1').textContent || '0');
    
    if (formativeSubtotalCell && totalMarks1 > 0) {
        const subtotal = parseFloat(formativeSubtotalCell.textContent || '0');
        const percentage = (subtotal / totalMarks1) * totalWeightage1;
        
        // Update percentage cell
        const percentageCell = row.querySelector('.formative-percent');
        if (percentageCell) {
            percentageCell.textContent = percentage.toFixed(2);
        }
    }
}

function calculateSummativeSubtotal(row) {
    const studentId = row.querySelector('.matric-number').textContent.trim();
    let summativeSubtotal = 0;
    
    // Sum summative inputs
    for (let i = 1; i <= 2; i++) {
        const input = row.querySelector(`input[name="summative-${i}-${studentId}"]`);
        if (input) {
            summativeSubtotal += parseFloat(input.value || '0');
        }
    }
    
    // Update summative subtotal cell
    const summativeSubtotalCell = row.querySelector('.summative-subtotal');
    if (summativeSubtotalCell) {
        summativeSubtotalCell.textContent = summativeSubtotal.toFixed(2);
    }

    // Calculate and update summative percentage with weightage
    const totalMarks2 = parseFloat(document.getElementById('total-marks-2').textContent || '0');
    const totalWeightage2 = parseFloat(document.getElementById('total-weightage-2').textContent || '0');
    
    if (summativeSubtotalCell && totalMarks2 > 0) {
        const subtotal = parseFloat(summativeSubtotalCell.textContent || '0');
        const percentage = (subtotal / totalMarks2) * totalWeightage2;
        
        // Update percentage cell
        const percentageCell = row.querySelector('.summative-percent');
        if (percentageCell) {
            percentageCell.textContent = percentage.toFixed(2);
        }
    }
}

function calculateTotalMark(row) {
    // Get formative and summative percentages
    const formativePercent = parseFloat(row.querySelector('.formative-percent')?.textContent || '0');
    const summativePercent = parseFloat(row.querySelector('.summative-percent')?.textContent || '0');
    
    // Calculate total mark
    const totalMark = formativePercent + summativePercent;
    
    // Update total mark cell
    const totalMarkCell = row.querySelector('.total-mark');
    if (totalMarkCell) {
        totalMarkCell.textContent = totalMark.toFixed(2);
    }
}

function calculateGrade(row) {
    const totalMark = parseFloat(row.querySelector('.total-mark')?.textContent || '0');
    const gradeCell = row.querySelector('.grade');
    const pointCell = row.querySelector('.point');
    const statusCell = row.querySelector('.status');

    if (!gradeCell || !pointCell || !statusCell) return;

    // Find appropriate grade based on total mark
    for (const [grade, criteria] of Object.entries(window.gradingScheme)) {
        if (totalMark >= criteria.min) {
            // Replace "_PLUS" with "+" and "_MINUS" with "-"
            let formattedGrade = grade.replace(/_PLUS/i, '+').replace(/_MINUS/i, '-').replace(/_/g, '');
        
            gradeCell.textContent = formattedGrade;
            pointCell.textContent = criteria.point.toFixed(2);
            statusCell.textContent = totalMark >= 50 ? 'PASS' : 'FAILED';
            break;
        }
    }
}

