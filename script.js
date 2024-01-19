$(document).ready(function () {
  $("#searchForm").submit(function (e) {
    e.preventDefault();
    const searchType = $("#searchType").val();
    const searchInput = $("#searchInput").val();
    searchCommunes(searchType, searchInput);
  });
});

function searchCommunes(type, query) {
  let apiUrl;

  switch (type) {
    case "regions":
      apiUrl = `https://geo.api.gouv.fr/regions?nom=${query}`;
      break;
    case "departements":
      apiUrl = `https://geo.api.gouv.fr/departements?nom=${query}`;
      break;
    default:
      apiUrl = `https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,region,departement,codesPostaux,code,population`;
  }

  $.ajax({
    url: apiUrl,
    dataType: "json",
    success: function (data) {
      const sortedData = data.sort(
        (a, b) => (b.population || 0) - (a.population || 0)
      );
      displayResults(sortedData, type);
    },
    error: function (xhr, textStatus, errorThrown) {
      if (xhr.status === 404) {
        displayError("Aucun résultat trouvé.");
      } else {
        displayError(
          `Une erreur s'est produite lors de la recherche. (${xhr.status} - ${errorThrown})`
        );
      }
    },
  });
}

function displayResults(results, type) {
  const resultsContainer = $("#results");
  resultsContainer.empty();

  if (results.length === 0) {
    return;
  }

  results.forEach((result) => {
    let codeInfo = result.codesPostaux
      ? `- ${result.codesPostaux.join(", ")}`
      : "";
    if (type === "regions" || type === "departements") {
      codeInfo = `- ${result.code || "N/A"}`;
    }

    const resultInfo = `
      <div class="result" data-result='${JSON.stringify(result)}'>
        <p class="result-info"><strong>${result.nom}</strong> ${codeInfo}</p>
        <div class="details">
          ${
            type === "communes"
              ? `
              <p><strong>Population:</strong> ${
                result.population ? result.population.toLocaleString() : "N/A"
              } habitants</p>
              
            <p><strong>Région:</strong> ${
              result.region
                ? `${result.region.nom} (${result.region.code || "N/A"})`
                : "N/A"
            }</p>
            <p><strong>Département:</strong> ${
              result.departement
                ? `${result.departement.nom} (${
                    result.departement.code || "N/A"
                  })`
                : "N/A"
            }</p>
            <p><strong>Code:</strong> ${result.code || "N/A"}</p>
          `
              : ""
          }
        </div>
      </div>
    `;
    resultsContainer.append(resultInfo);
  });

  $(".result").click(function () {
    const details = $(this).find(".details");
    details.slideToggle();
  });
}

function displayError(message) {
  const resultsContainer = $("#results");
  const resultCountContainer = $("#resultCount");
  resultCountContainer.html("");
  resultsContainer.html(`<p id="error">${message}</p>`);
}
