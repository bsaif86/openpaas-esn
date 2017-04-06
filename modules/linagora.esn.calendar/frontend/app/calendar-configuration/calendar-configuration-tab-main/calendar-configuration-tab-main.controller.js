(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabMainController', CalendarConfigurationTabMainController);

  function CalendarConfigurationTabMainController(
    $q,
    $modal,
    $state,
    calendarService,
    session,
    userUtils,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    calUIAuthorizationService
  ) {
    var self = this;
    var rightLabels = {};

    self.$onInit = $onInit;
    self.openDeleteConfirmationDialog = openDeleteConfirmationDialog;
    self.removeCalendar = removeCalendar;
    self.canDeleteCalendar = canDeleteCalendar;

    ///////////
    function $onInit() {
      self.publicRights = [
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ,
          name: 'Read'
        },
        {
          value: CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE,
          name: 'Write'
        }, {
          value: CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY,
          name: 'Private'
        }, {
          value: CAL_CALENDAR_PUBLIC_RIGHT.NONE,
          name: 'None'
        }
      ];

      rightLabels[CAL_CALENDAR_SHARED_RIGHT.NONE] = 'None';
      rightLabels[CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ] = 'Read only';
      rightLabels[CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE] = 'Read and Write';
      rightLabels[CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN] = 'Administration';
      rightLabels[CAL_CALENDAR_SHARED_RIGHT.SHAREE_FREE_BUSY] = 'Free/Busy';

      performSharedCalendarOperations(self.externalCalendar);

      self.canModifyPublicSelection = _canModifyPublicSelection();
    }

    function openDeleteConfirmationDialog() {
      self.modal = $modal({
        templateUrl: '/calendar/app/calendar-configuration/calendar-configuration-delete-confirmation/calendar-configuration-delete-confirmation.html',
        controller: function($scope) {
          $scope.calendarName = self.calendar.name;
          $scope.delete = removeCalendar;
        },
        backdrop: 'static',
        placement: 'center'
      });
    }

    function removeCalendar() {
      calendarService.removeCalendar(self.calendarHomeId, self.calendar).then(function() {
        $state.go('calendar.main');
      });
    }

    function canDeleteCalendar() {
      return !self.newCalendar && calUIAuthorizationService.canDeleteCalendar(self.calendar);
    }

    function _canModifyPublicSelection() {
      return calUIAuthorizationService.canModifyPublicSelection(self.calendar, session.user._id);
    }

    function performSharedCalendarOperations(isSharedCalendar) {
      $q.when(isSharedCalendar)
        .then(function(isSharedCalendar) {
          if (!isSharedCalendar) {
            return $q.reject('Not a shared calendar');
          }
          var shareeRightRaw = self.calendar.rights.getShareeRight(session.user._id);

          self.shareeRight = rightLabels[shareeRightRaw];

          return self.calendar.getOwner();
        })
        .then(function(sharedCalendarOwner) {
          self.sharedCalendarOwner = sharedCalendarOwner;
          self.displayNameOfSharedCalendarOwner = userUtils.displayNameOf(sharedCalendarOwner);
        })
        .catch(angular.noop);
    }
  }
})();