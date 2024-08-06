const RI = {
    1: 0,
    2: 0,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49
  };
  
  function addCriterion() {
    const criteriaInputs = document.getElementById('criteriaInputs');
    if (criteriaInputs.children.length < 5) {
      const div = document.createElement('div');
      div.className = 'criterion';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'criteria';
      input.placeholder = `Criterion ${criteriaInputs.children.length + 1}`;
      
      div.appendChild(input);
      criteriaInputs.appendChild(div);
      updatePlaceholders();
      toggleRemoveButton();
    } else {
      alert('You can add a maximum of 5 criteria.');
    }
  }
  
  function removeCriterion() {
    const criteriaInputs = document.getElementById('criteriaInputs');
    if (criteriaInputs.children.length > 3) {
      criteriaInputs.removeChild(criteriaInputs.lastElementChild);
      updatePlaceholders();
      toggleRemoveButton();
    }
  }
  
  function updatePlaceholders() {
    const criteriaInputs = document.getElementById('criteriaInputs');
    Array.from(criteriaInputs.children).forEach((div, index) => {
      const input = div.querySelector('input');
      input.placeholder = `Criterion ${index + 1}`;
    });
  }
  
  function toggleRemoveButton() {
    const removeButton = document.getElementById('removeCriterionBtn');
    const criteriaCount = document.getElementById('criteriaInputs').children.length;
    if (criteriaCount > 3) {
      removeButton.style.display = 'inline-block';
    } else {
      removeButton.style.display = 'none';
    }
  }
  
  function generatePairwiseInputs() {
    const criteria = Array.from(document.getElementsByName('criteria')).map(input => input.value);
    if (criteria.length < 2) {
      alert('Please enter at least 2 criteria');
      return;
    }
    const pairwiseDiv = document.getElementById('pairwiseComparison');
    pairwiseDiv.innerHTML = '';
  
    for (let i = 0; i < criteria.length - 1; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        const pairDiv = document.createElement('div');
        pairDiv.innerHTML = `
          <label><strong>Compare o ${criteria[i]} com o ${criteria[j]}</strong></label>:&nbsp
          <label>quanto <b>${criteria[i]}</b> é mais importante que <b>${criteria[j]}</b> ?&nbsp</label>
          <select name="compare_${i}_${j}" id="compare_${i}_${j}">
            <option value="" disabled selected>Quanto mais importante?</option>
            <option value="0.1111">1/9</option>
            <option value="0.125">1/8</option>
            <option value="0.1429">1/7</option>
            <option value="0.1667">1/6</option>
            <option value="0.2">1/5</option>
            <option value="0.25">1/4</option>
            <option value="0.3333">1/3</option>
            <option value="0.5">1/2</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
          <select name="compare_${j}_${i}" id="compare_${j}_${i}" style="display:none;">
            <option value="9">1/9</option>
            <option value="8">1/8</option>
            <option value="7">1/7</option>
            <option value="6">1/6</option>
            <option value="5">1/5</option>
            <option value="4">1/4</option>
            <option value="3">1/3</option>
            <option value="2">1/2</option>
            <option value="1">1</option>
            <option value="0.5">2</option>
            <option value="0.3333">3</option>
            <option value="0.25">4</option>
            <option value="0.2">5</option>
            <option value="0.1667">6</option>
            <option value="0.1429">7</option>
            <option value="0.125">8</option>
            <option value="0.1111">9</option>
          </select>
        `;
        pairwiseDiv.appendChild(pairDiv);
  
        document.getElementById(`compare_${i}_${j}`).addEventListener('change', function() {
          const oppositeSelect = document.getElementById(`compare_${j}_${i}`);
          oppositeSelect.value = (1 / parseFloat(this.value)).toString();
        });
      }
    }
  }
  
  function calculateAHP() {
    const criteria = Array.from(document.getElementsByName('criteria')).map(input => input.value);
    if (criteria.length < 2) {
      alert('Please enter at least 2 criteria');
      return;
    }
  
    const comparisonMatrix = Array(criteria.length).fill(0).map(() => Array(criteria.length).fill(0));
  
    criteria.forEach((criterion, i) => {
      comparisonMatrix[i][i] = 1;
      for (let j = i + 1; j < criteria.length; j++) {
        const value = parseFloat(document.querySelector(`[name="compare_${i}_${j}"]`).value);
        comparisonMatrix[i][j] = value;
        comparisonMatrix[j][i] = 1 / value;
      }
    });
  
    const criteriaWeights = calculateWeights(comparisonMatrix);
  
    const consistencyRatio = calculateConsistencyRatio(comparisonMatrix, criteriaWeights);
  
    let results = '<h2>Pesos dos Critérios</h2><ul>';
    criteria.forEach((criterion, i) => {
      results += `<li><strong>${criterion}:</strong> ${criteriaWeights[i].toFixed(2)}</li>`;
    });
    results += '</ul>';
  
    const consistencyMessage = document.getElementById('consistencyMessage');
    const adjustmentSuggestions = document.getElementById('adjustmentSuggestions');
  
    consistencyMessage.innerHTML = `<strong>Índice de Consistência: ${consistencyRatio.toFixed(2)}<strong>`;
    if (consistencyRatio > 0.1) {
      consistencyMessage.style.color = 'red';
      adjustmentSuggestions.innerHTML = "Adjustment suggestions: ";
      criteria.forEach((criterion, i) => {
        for (let j = i + 1; j < criteria.length; j++) {
          adjustmentSuggestions.innerHTML += `<br>Adjustments needed for criteria ${criteria[i]} and ${criteria[j]}: Try adjusting the judgments to achieve a consistency ratio below 0.1.`;
        }
      });
    } else {
      consistencyMessage.style.color = 'green';
      adjustmentSuggestions.innerHTML = '';
    }
  
    document.getElementById('results').innerHTML = results;
  }
  
  function calculateWeights(matrix) {
    const n = matrix.length;
    const sums = matrix[0].map((_, colIndex) => matrix.reduce((acc, row) => acc + row[colIndex], 0));
    const normalizedMatrix = matrix.map(row => row.map((value, colIndex) => value / sums[colIndex]));
    const weights = normalizedMatrix.map(row => row.reduce((acc, value) => acc + value, 0) / n);
    return weights;
  }
  
  function calculateConsistencyRatio(matrix, weights) {
    const n = matrix.length;
    const weightedSum = matrix.map((row, i) => row.reduce((acc, value, j) => acc + value * weights[j], 0));
    const lambdaMax = weightedSum.reduce((acc, value, i) => acc + value / weights[i], 0) / n;
    const consistencyIndex = (lambdaMax - n) / (n - 1);
    const consistencyRatio = consistencyIndex / RI[n];
    return consistencyRatio;
  }
  
  document.getElementById("calculateButton").addEventListener("click", calculateAHP);
  toggleRemoveButton();
  