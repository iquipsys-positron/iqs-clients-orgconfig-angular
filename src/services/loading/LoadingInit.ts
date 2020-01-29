function initPopulating(
    iqsShiftsViewModel: iqs.shell.IShiftsViewModel,
    iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
    iqsInvitationsViewModel: iqs.shell.IInvitationsViewModel,
    iqsMapViewModel: iqs.shell.IMapViewModel,
    iqsMapConfig: iqs.shell.IMapService,
    pipIdentity: pip.services.IIdentityService,
    iqsLoading: iqs.shell.ILoadingService,
    iqsOrganization: iqs.shell.IOrganizationService
) {
    iqsLoading.push('data', [
        iqsShiftsViewModel.clean.bind(iqsShiftsViewModel),
        iqsAccountsViewModel.clean.bind(iqsAccountsViewModel),
        iqsInvitationsViewModel.clean.bind(iqsInvitationsViewModel),
        iqsMapConfig.clean.bind(iqsMapConfig)
    ], async.parallel, [
            (callback) => {
                iqsShiftsViewModel.initShifts('all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsAccountsViewModel.initAccounts(
                    'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsInvitationsViewModel.initInvitations(
                    'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsMapConfig.orgId = iqsOrganization.orgId;
                iqsMapViewModel.initMap(
                    () => {
                        callback();
                    },
                    (error: any) => {
                        callback();
                    });
            },
        ]);
    if (pipIdentity.identity && pipIdentity.identity.id) {
        iqsLoading.start();
    }
}


let m: any;
const requires = [
    'iqsShifts.ViewModel',
    'iqsAccounts.ViewModel',
    'iqsInvitations.ViewModel',
    'iqsMap.ViewModel',
    'iqsMapConfig',
    'iqsOrganizations.Service',
];

try {
    m = angular.module('iqsLoading');
    m.requires.push(...requires);
    m.run(initPopulating);
} catch (err) { }