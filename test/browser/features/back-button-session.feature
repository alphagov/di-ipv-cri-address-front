@mock-errors @mock-api:address-success
Feature: Error handling

  API Errors in middle of journey

  Background:
    Given Back Button Betty is using the system
    And they have started the address journey
    And they searched for their postcode "E1 8QS"
    Then they should see the results page
    And they have selected an address ""
    Then they should see the address page
    Given they are on the address page
    When they add their residency date "2000"
    And they continue to confirm address
    And they should see the confirm page
    When they confirm their details
    Then they should be redirected as a success


  @mock-api:address-success @wip2
  Scenario: Back button history
    Given they have been redirected as a success
    When they return to a previous page
    Then they should be redirected as an access_denied error
#    And the error should be access_denied

