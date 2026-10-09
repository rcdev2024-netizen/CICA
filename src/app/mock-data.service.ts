import { Injectable } from '@angular/core';

export interface PolicyRecord {
  policy: string;
  agentId: string;
  agent: string;
  email: string;
  line: string;
  amount: number;
  status: 'Active' | 'Submitted' | 'Inactive' | 'On hold';
  client: string;
  issued: string;
  premium: number;
  billing: string;
  state: string;
}

export interface AgentRosterRecord {
  agentNumber: string;
  agentName: string;
  uplineHierarchy: string;
  contractCode: string;
  commissionPercentage: number;
  level: string;
  advanceVsAsEarned: 'Advance' | 'As-Earned';
  agencyMember: boolean;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly records: PolicyRecord[] = [
    { policy: 'B-100124', agentId: 'A-1023', agent: 'Maria Santos', email: 'maria.santos@cicalife.com', line: 'Life Insurance', amount: 500000, status: 'Active', client: 'Santos Financial Services', issued: 'Jan 15, 2026', premium: 84.5, billing: 'Monthly', state: 'California' },
    { policy: 'B-100126', agentId: 'A-1058', agent: 'John Apodaca', email: 'john.apodaca@cicalife.com', line: 'Health', amount: 750000, status: 'Active', client: 'Apodaca Family Trust', issued: 'Jan 18, 2026', premium: 126, billing: 'Monthly', state: 'Texas' },
    { policy: 'B-100127', agentId: 'A-1063', agent: 'David Garcia', email: 'david.garcia@cicalife.com', line: 'Annuity', amount: 620000, status: 'Active', client: 'Garcia Holdings', issued: 'Feb 02, 2026', premium: 210, billing: 'Quarterly', state: 'Arizona' },
    { policy: 'B-100128', agentId: 'A-1046', agent: 'Lisa Tan', email: 'lisa.tan@cicalife.com', line: 'Accident & Health', amount: 350000, status: 'Inactive', client: 'Tan & Co.', issued: 'Feb 09, 2026', premium: 69, billing: 'Monthly', state: 'Nevada' },
    { policy: 'B-100132', agentId: 'A-1023', agent: 'Maria Santos', email: 'maria.santos@cicalife.com', line: 'Life Insurance', amount: 425000, status: 'Active', client: 'Horizon Family Group', issued: 'Feb 21, 2026', premium: 92, billing: 'Monthly', state: 'California' },
    { policy: 'B-100135', agentId: 'A-1082', agent: 'Sophia Cruz', email: 'sophia.cruz@cicalife.com', line: 'Life Insurance', amount: 880000, status: 'Submitted', client: 'Cruz Family Office', issued: 'Mar 06, 2026', premium: 165, billing: 'Monthly', state: 'Florida' },
    { policy: 'B-100139', agentId: 'A-1046', agent: 'Lisa Tan', email: 'lisa.tan@cicalife.com', line: 'Health', amount: 290000, status: 'On hold', client: 'Northshore Dental', issued: 'Mar 13, 2026', premium: 78, billing: 'Monthly', state: 'Washington' },
    { policy: 'B-100142', agentId: 'A-1063', agent: 'David Garcia', email: 'david.garcia@cicalife.com', line: 'Annuity', amount: 540000, status: 'Active', client: 'Pacific Ridge Partners', issued: 'Apr 01, 2026', premium: 240, billing: 'Quarterly', state: 'Oregon' },
    { policy: 'B-100145', agentId: 'A-1058', agent: 'John Apodaca', email: 'john.apodaca@cicalife.com', line: 'Accident & Health', amount: 375000, status: 'Submitted', client: 'Apodaca Family Trust', issued: 'Apr 17, 2026', premium: 88, billing: 'Monthly', state: 'Texas' },
    { policy: 'B-100151', agentId: 'A-1082', agent: 'Sophia Cruz', email: 'sophia.cruz@cicalife.com', line: 'Life Insurance', amount: 960000, status: 'Active', client: 'Cruz Family Office', issued: 'May 07, 2026', premium: 188, billing: 'Monthly', state: 'Florida' },
    { policy: 'B-100158', agentId: 'A-1023', agent: 'Maria Santos', email: 'maria.santos@cicalife.com', line: 'Health', amount: 315000, status: 'Inactive', client: 'M Santos Consulting', issued: 'May 22, 2026', premium: 73, billing: 'Monthly', state: 'California' },
    { policy: 'B-100163', agentId: 'A-1063', agent: 'David Garcia', email: 'david.garcia@cicalife.com', line: 'Life Insurance', amount: 710000, status: 'Active', client: 'Garcia Holdings', issued: 'Jun 11, 2026', premium: 142, billing: 'Monthly', state: 'Arizona' },
    { policy: 'B-100169', agentId: 'A-1046', agent: 'Lisa Tan', email: 'lisa.tan@cicalife.com', line: 'Annuity', amount: 460000, status: 'Submitted', client: 'Tan & Co.', issued: 'Jun 23, 2026', premium: 195, billing: 'Quarterly', state: 'Nevada' },
    { policy: 'B-100174', agentId: 'A-1058', agent: 'John Apodaca', email: 'john.apodaca@cicalife.com', line: 'Life Insurance', amount: 525000, status: 'Active', client: 'Westlake Properties', issued: 'Jul 02, 2026', premium: 112, billing: 'Monthly', state: 'Texas' },
    { policy: 'B-100181', agentId: 'A-1082', agent: 'Sophia Cruz', email: 'sophia.cruz@cicalife.com', line: 'Accident & Health', amount: 410000, status: 'On hold', client: 'Lakeview Medical Group', issued: 'Jul 19, 2026', premium: 96, billing: 'Monthly', state: 'Florida' },
    { policy: 'B-100188', agentId: 'A-1023', agent: 'Maria Santos', email: 'maria.santos@cicalife.com', line: 'Life Insurance', amount: 685000, status: 'Active', client: 'Santos Financial Services', issued: 'Jul 27, 2026', premium: 138, billing: 'Monthly', state: 'California' },
    { policy: 'B-100193', agentId: 'A-1063', agent: 'David Garcia', email: 'david.garcia@cicalife.com', line: 'Health', amount: 330000, status: 'Submitted', client: 'Sonoran Family Care', issued: 'Jul 29, 2026', premium: 82, billing: 'Monthly', state: 'Arizona' },
    { policy: 'B-100201', agentId: 'A-1046', agent: 'Lisa Tan', email: 'lisa.tan@cicalife.com', line: 'Life Insurance', amount: 590000, status: 'Active', client: 'Silverline Ventures', issued: 'Jul 31, 2026', premium: 119, billing: 'Monthly', state: 'Nevada' }
  ];

  readonly agentRoster: AgentRosterRecord[] = [
    { agentNumber: 'A-1023', agentName: 'Maria Santos', uplineHierarchy: 'Gina Graber / West Team', contractCode: 'CICA-125', commissionPercentage: 80, level: 'Senior', advanceVsAsEarned: 'As-Earned', agencyMember: true },
    { agentNumber: 'A-1058', agentName: 'John Apodaca', uplineHierarchy: 'Gina Graber / West Team', contractCode: 'CICA-110', commissionPercentage: 75, level: 'Producer', advanceVsAsEarned: 'Advance', agencyMember: true },
    { agentNumber: 'A-1063', agentName: 'David Garcia', uplineHierarchy: 'Gina Graber / Southwest', contractCode: 'CICA-125', commissionPercentage: 80, level: 'Senior', advanceVsAsEarned: 'As-Earned', agencyMember: true },
    { agentNumber: 'A-1046', agentName: 'Lisa Tan', uplineHierarchy: 'Gina Graber / West Team', contractCode: 'CICA-100', commissionPercentage: 70, level: 'Producer', advanceVsAsEarned: 'Advance', agencyMember: true },
    { agentNumber: 'A-1082', agentName: 'Sophia Cruz', uplineHierarchy: 'Partner Agency / Florida', contractCode: 'CICA-125', commissionPercentage: 80, level: 'Senior', advanceVsAsEarned: 'As-Earned', agencyMember: false }
  ];

  readonly activities = [
    { type: 'issued', title: 'New policy issued', ref: 'P-0015', person: 'Ana Reyes', text: 'Life insurance policy has been issued successfully.', time: 'Jul 31, 2026 · 10:42 AM' },
    { type: 'submitted', title: 'Application submitted', ref: 'P-0014', person: 'Maria Santos', text: 'Application has been submitted for review.', time: 'Jul 29, 2026 · 09:12 PM' },
    { type: 'hold', title: 'Policy on hold', ref: 'P-0012', person: 'Nina Flores', text: 'Policy has been placed on hold due to pending documents.', time: 'Jul 28, 2026 · 08:45 AM' },
    { type: 'billing', title: 'Billing notification', ref: 'P-0013', person: 'Carla Santos', text: 'Payment reminder sent to client.', time: 'Jul 28, 2026 · 02:21 PM' },
    { type: 'issued', title: 'New policy issued', ref: 'P-0010', person: 'Lisa Tan', text: 'Life insurance policy has been issued successfully.', time: 'Jul 26, 2026 · 02:17 PM' },
    { type: 'submitted', title: 'Application submitted', ref: 'P-0009', person: 'David Garcia', text: 'Application has been submitted for review.', time: 'Jul 25, 2026 · 06:10 AM' },
    { type: 'hold', title: 'Policy on hold', ref: 'P-0008', person: 'Manuel Cruz', text: 'Policy has been placed on hold due to pending documents.', time: 'Jul 24, 2026 · 03:21 PM' },
    { type: 'submitted', title: 'Application submitted', ref: 'P-0007', person: 'James Reyes', text: 'Application has been submitted for review.', time: 'Jul 23, 2026 · 06:10 AM' }
  ];
}
