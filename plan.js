function calculateTotalMarks(className, totalId) {
    const marks = document.querySelectorAll(`.${className}`);
    let total = 0;
    
    marks.forEach(mark => {
        const markValue = mark.value.trim();
        total += markValue ? parseFloat(markValue) : 0;
    });

    document.getElementById(totalId).value = total;
}

// Update the calculateWeightage function to be more accurate
function calculateWeightage(className, totalId, allocationId) {
    const marks = document.querySelectorAll(`.${className}`);
    const allocation = Number(document.getElementById(allocationId)?.value) || 0;
    const classSuffix = className.split('-')[1];

    // Calculate total marks first
    let totalMarks = 0;
    marks.forEach(mark => {
        totalMarks += Number(mark.value) || 0;
    });

    // Calculate weightages
    marks.forEach((mark, index) => {
        const markValue = Number(mark.value) || 0;
        const weightageElement = document.querySelector(`input[name="weightage-${classSuffix}-${index + 1}"]`);
        
        if (weightageElement && allocation > 0 && totalMarks > 0) {
            // Calculate weightage as (mark/totalMarks) * allocation
            const weightage = (markValue / totalMarks) * allocation;
            weightageElement.value = weightage.toFixed(2);
        } else if (weightageElement) {
            weightageElement.value = '0.00';
        }
    });

    // Update total weightage
    calculateTotalWeightage(`weightage-${classSuffix}`, `total-weightage-${classSuffix}`);
}

function calculateTotalWeightage(className, totalWeightageId) {
    const weightages = document.querySelectorAll(`.${className}`);
    let totalWeightage = 0;
    weightages.forEach(weightage => {
        totalWeightage += parseFloat(weightage.value) || 0;
    });
    document.getElementById(totalWeightageId).value = totalWeightage;
}

function calculateFormative() {
    let totalFormative = 0;
    // Changed loop to include all 6 formative assessments
    for (let i = 1; i <= 6; i++) {
        const value = parseFloat(document.getElementById(`marks-allocation-${i}`).value) || 0;
        console.log(`Formative ${i}: ${value}`); // Debug log
        totalFormative += value;
    }
    document.getElementById('percent-1').value = totalFormative;
    console.log('Total Formative:', totalFormative); // Debug log
}

function calculateSummative() {
    let totalSummative = 0;
    // Changed range to cover assessments 7 and 8
    for (let i = 7; i <= 8; i++) {
        const value = parseFloat(document.getElementById(`marks-allocation-${i}`).value) || 0;
        console.log(`Summative ${i}: ${value}`); // Debug log
        totalSummative += value;
    }
    document.getElementById('percent-2').value = totalSummative;
    console.log('Total Summative:', totalSummative); // Debug log
}

function calculatePercentage() {
    const formativePercent = parseFloat(document.getElementById('percent-1').value) || 0;
    const summativePercent = parseFloat(document.getElementById('percent-2').value) || 0;
    const totalPercent = formativePercent + summativePercent;
    document.getElementById('total-percent').value = totalPercent;
}

function collectAssessmentData() {
    const assessmentData = {
        formative: {},
        summative: {},
        totals: {}
    };

    // Collect formative assessments (1-6)
    for (let i = 1; i <= 6; i++) {
        assessmentData.formative[`assessment-${i}`] = collectBlockData(i);
    }

    // Collect summative assessments (7-8)
    for (let i = 7; i <= 8; i++) {
        assessmentData.summative[`assessment-${i-6}`] = collectBlockData(i);
    }

    // Collect totals
    assessmentData.totals = {
        formativePercent: document.getElementById('percent-1').value,
        summativePercent: document.getElementById('percent-2').value,
        totalPercent: document.getElementById('total-percent').value
    };

    return assessmentData;
}

function collectBlockData(blockNum) {
    return {
        name: document.querySelector(`input[name="assessment-name-${blockNum}"]`).value,
        marksAllocation: document.querySelector(`input[name="marks-allocation-${blockNum}"]`).value,
        clo: Array.from({length: 6}, (_, j) => 
            document.querySelector(`input[name="clo-${blockNum}-${j+1}"]`).value
        ),
        marks: Array.from({length: 6}, (_, j) => 
            document.querySelector(`input[name="marks-${blockNum}-${j+1}"]`).value
        ),
        weightage: Array.from({length: 6}, (_, j) => 
            document.querySelector(`input[name="weightage-${blockNum}-${j+1}"]`).value
        ),
        total: {
            marks: document.getElementById(`total-marks-${blockNum}`).value,
            weightage: document.getElementById(`total-weightage-${blockNum}`).value
        }
    };
}

// Update the saveAssessmentPlan function
function saveAssessmentPlan() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    
    if (!courseId) {
        alert('No course ID found!');
        return Promise.reject(new Error('No course ID found'));
    }

    // Calculate all totals before saving
    for (let i = 1; i <= 8; i++) {
        calculateTotalMarks(`marks-${i}`, `total-marks-${i}`);
        calculateWeightage(`marks-${i}`, `total-marks-${i}`, `marks-allocation-${i}`);
        calculateTotalWeightage(`weightage-${i}`, `total-weightage-${i}`);
    }
    calculateFormative();
    calculateSummative();
    calculatePercentage();

    const assessmentData = {
        formative: {},
        summative: {},
        totals: {}
    };

    // Collect formative assessments (1-6)
    for (let i = 1; i <= 6; i++) {
        assessmentData.formative[`assessment${i}`] = {
            name: document.querySelector(`input[name="assessment-name-${i}"]`).value,
            marksAllocation: document.querySelector(`input[name="marks-allocation-${i}"]`).value,
            clo: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="clo-${i}-${j+1}"]`).value),
            marks: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="marks-${i}-${j+1}"]`).value),
            weightage: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="weightage-${i}-${j+1}"]`).value),
            total: {
                marks: document.getElementById(`total-marks-${i}`).value,
                weightage: document.getElementById(`total-weightage-${i}`).value
            }
        };
    }

    // Collect summative assessments (7-8)
    for (let i = 7; i <= 8; i++) {
        assessmentData.summative[`assessment${i-6}`] = {
            name: document.querySelector(`input[name="assessment-name-${i}"]`).value,
            marksAllocation: document.querySelector(`input[name="marks-allocation-${i}"]`).value,
            clo: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="clo-${i}-${j+1}"]`).value),
            marks: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="marks-${i}-${j+1}"]`).value),
            weightage: Array.from({length: 6}, (_, j) => 
                document.querySelector(`input[name="weightage-${i}-${j+1}"]`).value),
            total: {
                marks: document.getElementById(`total-marks-${i}`).value,
                weightage: document.getElementById(`total-weightage-${i}`).value
            }
        };
    }

    // Save totals
    assessmentData.totals = {
        formativePercent: document.getElementById('percent-1').value,
        summativePercent: document.getElementById('percent-2').value,
        totalPercent: document.getElementById('total-percent').value
    };

    // Save to Firebase and handle the response
    return firebase.database().ref(`assessmentPlans/${courseId}`).set(assessmentData)
        .then(() => {
            console.log('Assessment plan saved successfully');
            prefillFormAfterSave(assessmentData);
            return assessmentData;
        })
        .catch(error => {
            console.error('Error saving assessment plan:', error);
            throw error;
        });
}

// Update the prefillFormAfterSave function
function prefillFormAfterSave(data) {
    try {
        // Prefill formative assessments
        for (let i = 1; i <= 6; i++) {
            const assessment = data.formative[`assessment${i}`];
            if (assessment) {
                // Set assessment name and allocation
                document.querySelector(`input[name="assessment-name-${i}"]`).value = assessment.name || '';
                document.querySelector(`input[name="marks-allocation-${i}"]`).value = assessment.marksAllocation || '';
                
                // Set individual marks and trigger calculations
                for (let j = 1; j <= 6; j++) {
                    const cloInput = document.querySelector(`input[name="clo-${i}-${j}"]`);
                    const marksInput = document.querySelector(`input[name="marks-${i}-${j}"]`);
                    const weightageInput = document.querySelector(`input[name="weightage-${i}-${j}"]`);
                    
                    if (cloInput && marksInput && weightageInput) {
                        cloInput.value = assessment.clo[j-1] || '';
                        marksInput.value = assessment.marks[j-1] || '';
                        // Don't set weightage directly, it will be calculated
                    }
                }

                // Trigger calculations for this assessment block
                calculateTotalMarks(`marks-${i}`, `total-marks-${i}`);
                calculateWeightage(`marks-${i}`, `total-marks-${i}`, `marks-allocation-${i}`);
                calculateTotalWeightage(`weightage-${i}`, `total-weightage-${i}`);
            }
        }

        // Prefill summative assessments
        for (let i = 7; i <= 8; i++) {
            const assessment = data.summative[`assessment${i-6}`];
            if (assessment) {
                // Set assessment name and allocation
                document.querySelector(`input[name="assessment-name-${i}"]`).value = assessment.name || '';
                document.querySelector(`input[name="marks-allocation-${i}"]`).value = assessment.marksAllocation || '';
                
                // Set individual marks and trigger calculations
                for (let j = 1; j <= 6; j++) {
                    const cloInput = document.querySelector(`input[name="clo-${i}-${j}"]`);
                    const marksInput = document.querySelector(`input[name="marks-${i}-${j}"]`);
                    const weightageInput = document.querySelector(`input[name="weightage-${i}-${j}"]`);
                    
                    if (cloInput && marksInput && weightageInput) {
                        cloInput.value = assessment.clo[j-1] || '';
                        marksInput.value = assessment.marks[j-1] || '';
                        // Don't set weightage directly, it will be calculated
                    }
                }

                // Trigger calculations for this assessment block
                calculateTotalMarks(`marks-${i}`, `total-marks-${i}`);
                calculateWeightage(`marks-${i}`, `total-marks-${i}`, `marks-allocation-${i}`);
                calculateTotalWeightage(`weightage-${i}`, `total-weightage-${i}`);
            }
        }

        // Calculate overall totals and percentages
        calculateFormative();
        calculateSummative();
        calculatePercentage();

    } catch (error) {
        console.error('Error prefilling form:', error);
    }
}

// Update the event listener
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            for (let i = 1; i <= 8; i++) {
                try {
                    calculateTotalMarks(`marks-${i}`, `total-marks-${i}`);
                    calculateWeightage(`marks-${i}`, `total-marks-${i}`, `marks-allocation-${i}`);
                    calculateTotalWeightage(`weightage-${i}`, `total-weightage-${i}`);
                } catch (error) {
                    console.error(`Error calculating block ${i}:`, error);
                }
            }
            calculateFormative();
            calculateSummative();
            calculatePercentage();
        });
    });

    // Add save button event listener
    const saveButton = document.querySelector('button:nth-of-type(2)');
    if (saveButton) {
        saveButton.addEventListener('click', saveAssessmentPlan);
    }

    // Add save and continue button event listener
    const saveAndContinueButton = document.querySelector('button:nth-of-type(3)');
    if (saveAndContinueButton) {
        saveAndContinueButton.addEventListener('click', () => {
            saveAssessmentPlan();
            // Navigation is handled by the onclick attribute in the HTML
        });
    }

    // Load saved data when page loads
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    if (courseId) {
        firebase.database().ref(`assessmentPlans/${courseId}`).once('value')
            .then(snapshot => {
                const savedData = snapshot.val();
                if (savedData) {
                    prefillFormAfterSave(savedData);
                }
            })
            .catch(error => console.error('Error loading saved data:', error));
    }

    // Add event listeners for marks-allocation inputs
    document.querySelectorAll('input[id^="marks-allocation-"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const assessmentNum = e.target.id.split('-')[2];
            calculateWeightage(`marks-${assessmentNum}`, `total-marks-${assessmentNum}`, e.target.id);
            if (assessmentNum <= 6) {
                calculateFormative();
            } else {
                calculateSummative();
            }
            calculatePercentage();
        });
    });
});