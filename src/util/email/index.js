const mjml2html = require('mjml');

require('handlebars-helpers')();
const handlebars = require('handlebars');

exports.createInductionEmailBody = (inductorName, trainingItemName) =>
  `${inductorName} has added you to the following induction item: ${trainingItemName}. Please click the button below to confirm your induction within 48 hours.`;

// take in a template and data object and return the html
exports.renderEmailBody = (template, data) => {
  const templateString = handlebars.compile(template);
  return templateString(data);
};

exports.getActionEmailHtml = ({
  bodyText,
  bodyHtml,
  actionButtonText,
  actionButtonLink
}) =>
  mjml2html(`
<mjml>
  <mj-body>
    <mj-section>
      <mj-column width="600px">
        <mj-image width="300px" src="https://res.cloudinary.com/db8zpy2k5/image/upload/v1623567889/logo_iunb8b.png"></mj-image>

      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Intro text -->
    </mj-raw>
    <mj-section background-color="#fafafa">
      <mj-column width="400px" font-size="16px">
        <mj-text color="#525252">
        ${bodyHtml || bodyText || ''}
        </mj-text>
        ${actionButtonLink  ? `<mj-button background-color="#ff2709" href="${actionButtonLink}">${actionButtonText || 'Click Me!'}</mj-button>` : ''}
      </mj-column>
    </mj-section>
    <mj-section background-color="#fafafa">
      <mj-column>
        <mj-social border-radius="0" icon-size="40px" mode="horizontal" line-height="0">
          <mj-social-element src="https://cdn.simpleicons.org/discord/black" target="_blank" name="slack" href="https://discord.com/invite/Axw2kJ8GbQ" alt="Discord">
          </mj-social-element>
          <mj-social-element target="_blank" src="https://cdn.simpleicons.org/facebook/black" href="https://www.facebook.com/uwamakers/" alt="Facebook">

          </mj-social-element>
          <mj-social-element target="_blank" src="https://cdn.simpleicons.org/instagram/black" href="https://www.instagram.com/uwa_makers/?hl=en" alt="Instagram">

          </mj-social-element>
        </mj-social>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`).html;
